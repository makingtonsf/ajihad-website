import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  formulairesContact, candidatures, contributions, demandesPartenariat
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { notifyOwner } from "../_core/notification";
import { modeDemo, demo } from "../_core/devFixtures";
import { sauvegarderPieceJointe } from "../_core/candidatureFiles";

function generateRef(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;
}

const QUESTIONS_CANDIDATURE = {
  membre: [
    { id: "objectif", multiple: false, options: ["Participer aux activités", "Développer mes compétences", "Contribuer à la gouvernance", "Accéder au réseau de membres"] },
    { id: "axes", multiple: true, options: ["Éducation", "Leadership", "Engagement citoyen", "Environnement", "Innovation numérique"] },
    { id: "engagement", multiple: false, options: ["Occasionnel", "Régulier", "Responsabilité de commission"] },
  ],
  benevole: [
    { id: "missions", multiple: true, options: ["Formation", "Mobilisation communautaire", "Événements", "Communication", "Environnement"] },
    { id: "rythme", multiple: false, options: ["Ponctuellement", "Quelques heures par semaine", "Plusieurs jours par mois"] },
    { id: "terrain", multiple: false, options: ["Oui", "Non", "Selon les projets"] },
  ],
  ambassadeur: [
    { id: "zoneRayonnement", multiple: false, options: ["Ma commune", "Mon département", "La diaspora", "International"] },
    { id: "reseaux", multiple: true, options: ["Associations", "Écoles et universités", "Entreprises", "Institutions", "Diaspora"] },
    { id: "representation", multiple: false, options: ["Oui, régulièrement", "Oui, occasionnellement", "Non, mais je souhaite apprendre"] },
  ],
} as const;

function validerReponsesCandidature(type: keyof typeof QUESTIONS_CANDIDATURE | "projefa", reponses?: Record<string, string>) {
  if (type === "projefa") return;
  for (const question of QUESTIONS_CANDIDATURE[type]) {
    const valeur = reponses?.[question.id]?.trim() ?? "";
    const choix = valeur.split("||").map(v => v.trim()).filter(Boolean);
    if (choix.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `La réponse à la question « ${question.id} » est requise.` });
    }
    if ((!question.multiple && choix.length !== 1) || choix.some(choixUnique => !question.options.includes(choixUnique as never))) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `La réponse à la question « ${question.id} » est invalide.` });
    }
  }
}

type TableAccusable =
  | typeof formulairesContact
  | typeof candidatures
  | typeof contributions
  | typeof demandesPartenariat;

/**
 * Notifie le propriétaire du site (admin AJIHAD) d'une nouvelle soumission puis
 * marque `accuseEnvoye` à true. Toute erreur est absorbée : la notification ne
 * doit jamais faire échouer l'enregistrement du formulaire côté visiteur.
 */
async function accuserReception(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  table: TableAccusable,
  reference: string,
  titre: string,
  resume: string,
): Promise<void> {
  try {
    const envoye = await notifyOwner({ title: titre, content: resume });
    if (!envoye) return;
    await db.update(table).set({ accuseEnvoye: true }).where(eq(table.reference, reference));
  } catch (error) {
    console.warn(`[Forms] Accusé de réception non envoyé pour ${reference}:`, error);
  }
}

export const formsRouter = router({
  // Submit contact form
  submitContact: publicProcedure
    .input(z.object({
      nomComplet: z.string().min(2).max(200),
      email: z.string().email().max(320),
      telephone: z.string().max(30).optional(),
      organisation: z.string().max(200).optional(),
      objet: z.string().min(3).max(300),
      message: z.string().min(10).max(5000),
      type: z.enum(["general", "partenariat", "media", "contribution"]).default("general"),
      consentement: z.boolean().refine(v => v === true, "Vous devez accepter la politique de confidentialité"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Service temporairement indisponible");
      const reference = generateRef("CTT");
      await db.insert(formulairesContact).values({
        reference,
        nomComplet: input.nomComplet,
        email: input.email,
        telephone: input.telephone,
        organisation: input.organisation,
        objet: input.objet,
        message: input.message,
        type: input.type,
        statut: "nouveau",
        accuseEnvoye: false,
      });
      await accuserReception(
        db, formulairesContact, reference,
        `Nouvelle soumission CONTACT — Réf. ${reference}`,
        [
          `Nom : ${input.nomComplet}`,
          `E-mail : ${input.email}`,
          input.telephone ? `Téléphone : ${input.telephone}` : null,
          input.organisation ? `Organisation : ${input.organisation}` : null,
          `Type : ${input.type}`,
          `Objet : ${input.objet}`,
        ].filter(Boolean).join("\n"),
      );
      return { success: true, reference, message: `Votre message a été reçu. Référence : ${reference}` };
    }),

  // Submit membership/volunteer/ambassador application
  submitCandidature: publicProcedure
    .input(z.object({
      type: z.enum(["membre", "benevole", "ambassadeur", "projefa"]),
      prenom: z.string().min(2).max(100),
      nom: z.string().min(2).max(100),
      email: z.string().email().max(320),
      telephone: z.string().max(30).optional(),
      adresse: z.string().max(500).optional(),
      departement: z.string().max(100).optional(),
      commune: z.string().max(100).optional(),
      niveauEtude: z.string().max(100).optional(),
      competences: z.string().max(2000).optional(),
      motivation: z.string().min(20).max(3000),
      disponibilite: z.string().max(200).optional(),
      experienceAssociative: z.string().max(2000).optional(),
      reponses: z.record(z.string(), z.string()).optional(),
      cv: z.object({
        data: z.string().max(8_000_000), name: z.string().min(1).max(255),
        size: z.number().int().positive().max(5 * 1024 * 1024), type: z.string().max(100),
      }).optional(),
      photo: z.object({
        data: z.string().max(5_000_000), name: z.string().min(1).max(255),
        size: z.number().int().positive().max(3 * 1024 * 1024), type: z.string().max(100),
      }).optional(),
      consentement: z.boolean().refine(v => v === true, "Vous devez accepter les conditions"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const prefix = input.type === "membre" ? "MBR" : input.type === "benevole" ? "BNV" : input.type === "ambassadeur" ? "AMB" : "PRJ";
      const reference = generateRef(prefix);
      const { consentement, cv, photo, reponses, ...data } = input;
      validerReponsesCandidature(input.type, reponses);
      const [cvSauve, photoSauvee] = await Promise.all([
        sauvegarderPieceJointe(cv, "cv"),
        sauvegarderPieceJointe(photo, "photo"),
      ]);
      const donnees = {
        ...data,
        cvUrl: cvSauve?.url,
        cvNom: cvSauve?.nom,
        cvTaille: cvSauve?.taille,
        photoUrl: photoSauvee?.url,
        photoNom: photoSauvee?.nom,
        photoTaille: photoSauvee?.taille,
        reponses: reponses && Object.keys(reponses).length > 0 ? JSON.stringify(reponses) : undefined,
      };
      if (!db) {
        if (!modeDemo()) throw new Error("Service temporairement indisponible");
        demo.table("candidatures").creer({ ...donnees, reference, statut: "recue", accuseEnvoye: false });
        return { success: true, reference, message: `Votre candidature a été reçue. Référence : ${reference}` };
      }
      await db.insert(candidatures).values({ ...donnees, reference, statut: "recue", accuseEnvoye: false });
      await accuserReception(
        db, candidatures, reference,
        `Nouvelle soumission CANDIDATURE (${input.type}) — Réf. ${reference}`,
        [
          `Candidat : ${input.prenom} ${input.nom}`,
          `E-mail : ${input.email}`,
          input.telephone ? `Téléphone : ${input.telephone}` : null,
          input.departement ? `Département : ${input.departement}` : null,
          `Type de candidature : ${input.type}`,
        ].filter(Boolean).join("\n"),
      );
      return { success: true, reference, message: `Votre candidature a été reçue. Référence : ${reference}` };
    }),

  // Submit contribution declaration
  submitContribution: publicProcedure
    .input(z.object({
      nomContributeur: z.string().max(200).optional(),
      email: z.string().email().max(320).optional(),
      pays: z.string().max(100).optional(),
      typeContribution: z.enum(["financiere", "nature", "partenariat", "promesse"]).default("financiere"),
      projetSoutenu: z.string().max(200).optional(),
      montant: z.string().max(50).optional(),
      devise: z.string().max(10).default("USD"),
      moyenContribution: z.string().max(100).optional(),
      commentaire: z.string().max(2000).optional(),
      souhaitRecu: z.boolean().default(false),
      consentement: z.boolean().refine(v => v === true, "Vous devez accepter les conditions"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Service temporairement indisponible");
      const reference = generateRef("CTB");
      const { consentement, ...data } = input;
      await db.insert(contributions).values({ ...data, reference, statut: "declaree", accuseEnvoye: false });
      await accuserReception(
        db, contributions, reference,
        `Nouvelle soumission CONTRIBUTION — Réf. ${reference}`,
        [
          `Contributeur : ${input.nomContributeur ?? "Anonyme"}`,
          input.email ? `E-mail : ${input.email}` : null,
          `Type : ${input.typeContribution}`,
          input.montant ? `Montant : ${input.montant} ${input.devise}` : null,
          input.projetSoutenu ? `Projet soutenu : ${input.projetSoutenu}` : null,
        ].filter(Boolean).join("\n"),
      );
      return { success: true, reference, message: `Votre déclaration de contribution a été enregistrée. Référence : ${reference}` };
    }),

  // Submit partnership request
  submitPartenariat: publicProcedure
    .input(z.object({
      nomOrganisation: z.string().min(2).max(200),
      nomContact: z.string().min(2).max(200),
      fonction: z.string().max(200).optional(),
      email: z.string().email().max(320),
      telephone: z.string().max(30).optional(),
      pays: z.string().max(100).optional(),
      typeOrganisation: z.string().max(100).optional(),
      domaineCollaboration: z.string().max(200).optional(),
      projetConcerne: z.string().max(200).optional(),
      message: z.string().min(20).max(3000),
      consentement: z.boolean().refine(v => v === true, "Vous devez accepter les conditions"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Service temporairement indisponible");
      const reference = generateRef("PRT");
      const { consentement, ...data } = input;
      await db.insert(demandesPartenariat).values({ ...data, reference, statut: "recue", accuseEnvoye: false });
      await accuserReception(
        db, demandesPartenariat, reference,
        `Nouvelle soumission PARTENARIAT — Réf. ${reference}`,
        [
          `Organisation : ${input.nomOrganisation}`,
          `Contact : ${input.nomContact}${input.fonction ? ` (${input.fonction})` : ""}`,
          `E-mail : ${input.email}`,
          input.pays ? `Pays : ${input.pays}` : null,
          input.domaineCollaboration ? `Domaine : ${input.domaineCollaboration}` : null,
        ].filter(Boolean).join("\n"),
      );
      return { success: true, reference, message: `Votre demande de partenariat a été reçue. Référence : ${reference}` };
    }),
});
