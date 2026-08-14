import { useState } from "react";
import { Link } from "wouter";
import { Users, Heart, Globe, Handshake, ArrowRight, CheckCircle, ChevronRight, Star } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useConfigSite } from "@/hooks/useConfigSite";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { emailValide } from "@/lib/validation";

// Habillage et identifiant technique des formes d'implication. L'identifiant
// pilote le formulaire soumis et reste donc figé ; seuls les textes sont
// modifiables depuis l'administration.
const FORMES_TECHNIQUES = [
  { id: "membre", icon: Users, color: "#185FA5" },
  { id: "benevole", icon: Heart, color: "#B64926" },
  { id: "ambassadeur", icon: Globe, color: "#4DBFBF" },
  { id: "partenariat", icon: Handshake, color: "#F4A022" },
];

const emptyCandidature = {
  prenom: "", nom: "", email: "", telephone: "", adresse: "", departement: "", commune: "",
  niveauEtude: "", competences: "", motivation: "", disponibilite: "", experienceAssociative: "",
  reponses: {} as Record<string, string>, cv: null as PieceJointe | null, photo: null as PieceJointe | null,
  consentement: false,
};
const emptyPartenariat = {
  nomOrganisation: "", nomContact: "", fonction: "", email: "", telephone: "",
  pays: "", typeOrganisation: "", domaineCollaboration: "", projetConcerne: "",
  message: "", consentement: false,
};

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";
const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

type PieceJointe = { data: string; name: string; size: number; type: string };
type RoleCandidature = "membre" | "benevole" | "ambassadeur";
type QuestionCandidature = { id: string; label: string; options: string[]; multiple?: boolean; required?: boolean };

const QUESTIONNAIRES: Record<RoleCandidature, QuestionCandidature[]> = {
  membre: [
    { id: "objectif", label: "Quel est votre principal objectif en rejoignant AJIHAD ?", options: ["Participer aux activités", "Développer mes compétences", "Contribuer à la gouvernance", "Accéder au réseau de membres"], required: true },
    { id: "axes", label: "Quels axes vous intéressent ?", options: ["Éducation", "Leadership", "Engagement citoyen", "Environnement", "Innovation numérique"], multiple: true, required: true },
    { id: "engagement", label: "Quel niveau d'engagement envisagez-vous ?", options: ["Occasionnel", "Régulier", "Responsabilité de commission"], required: true },
  ],
  benevole: [
    { id: "missions", label: "Quelles missions souhaitez-vous soutenir ?", options: ["Formation", "Mobilisation communautaire", "Événements", "Communication", "Environnement"], multiple: true, required: true },
    { id: "rythme", label: "À quel rythme pouvez-vous aider ?", options: ["Ponctuellement", "Quelques heures par semaine", "Plusieurs jours par mois"], required: true },
    { id: "terrain", label: "Êtes-vous disponible pour des activités de terrain ?", options: ["Oui", "Non", "Selon les projets"], required: true },
  ],
  ambassadeur: [
    { id: "zoneRayonnement", label: "Dans quelle zone souhaitez-vous représenter AJIHAD ?", options: ["Ma commune", "Mon département", "La diaspora", "International"], required: true },
    { id: "reseaux", label: "Quels réseaux pouvez-vous mobiliser ?", options: ["Associations", "Écoles et universités", "Entreprises", "Institutions", "Diaspora"], multiple: true, required: true },
    { id: "representation", label: "Avez-vous déjà représenté une organisation ?", options: ["Oui, régulièrement", "Oui, occasionnellement", "Non, mais je souhaite apprendre"], required: true },
  ],
};

const TAILLE_MAX_CV = 5 * 1024 * 1024;
const TAILLE_MAX_PHOTO = 3 * 1024 * 1024;

function tailleLisible(taille: number) {
  if (taille >= 1024 * 1024) return `${(taille / (1024 * 1024)).toFixed(1)} Mo`;
  return `${Math.max(1, Math.round(taille / 1024))} Ko`;
}

function lirePieceJointe(fichier: File): Promise<PieceJointe> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve({ data: String(lecteur.result), name: fichier.name, size: fichier.size, type: fichier.type });
    lecteur.onerror = () => reject(new Error("Impossible de lire ce fichier."));
    lecteur.readAsDataURL(fichier);
  });
}

export default function SImpliquer() {
  const { liste } = useConfigSite();
  // Un seul formulaire public : la fonction choisie pilote son questionnaire.
  const [activeForm, setActiveForm] = useState<string>("membre");
  const [form, setForm] = useState(emptyCandidature);
  const [formPrt, setFormPrt] = useState(emptyPartenariat);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const estPartenariat = activeForm === "partenariat";
  const questionsActives = QUESTIONNAIRES[activeForm as RoleCandidature] ?? [];

  const mutation = trpc.forms.submitCandidature.useMutation({
    onSuccess: (data) => { setSubmitted(true); setReference(data.reference); toast.success(`Candidature reçue ! Référence : ${data.reference}`); },
    onError: (err) => toast.error(`Erreur : ${err.message}`),
  });

  const mutationPartenariat = trpc.forms.submitPartenariat.useMutation({
    onSuccess: (data) => { setSubmitted(true); setReference(data.reference); toast.success(`Demande de partenariat reçue ! Référence : ${data.reference}`); },
    onError: (err) => toast.error(`Erreur : ${err.message}`),
  });

  const changerFonction = (id: string) => {
    setActiveForm(id);
    setSubmitted(false);
    setReference("");
    setErreurs({});
    setForm(p => ({ ...p, reponses: {} }));
  };

  const ouvrirFormulaire = (id: string) => {
    changerFonction(id);
    document.getElementById("formulaire-implication")?.scrollIntoView({ behavior: "smooth" });
  };

  const choisirPieceJointe = async (champ: "cv" | "photo", fichier?: File) => {
    if (!fichier) return;
    const estCv = champ === "cv";
    const types = estCv ? ["application/pdf"] : ["image/jpeg", "image/png", "image/webp"];
    const tailleMax = estCv ? TAILLE_MAX_CV : TAILLE_MAX_PHOTO;
    if (!types.includes(fichier.type)) {
      toast.error(estCv ? "Le CV doit être au format PDF." : "La photo doit être au format JPG, PNG ou WebP.");
      return;
    }
    if (fichier.size > tailleMax) {
      toast.error(estCv ? "Le CV ne doit pas dépasser 5 Mo." : "La photo ne doit pas dépasser 3 Mo.");
      return;
    }
    try {
      const piece = await lirePieceJointe(fichier);
      setForm(p => ({ ...p, [champ]: piece }));
      effacerErreur(`${champ}-imp`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de lire ce fichier.");
    }
  };

  const effacerErreur = (champ: string) => {
    setErreurs(prev => {
      if (!prev[champ]) return prev;
      const suivant = { ...prev };
      delete suivant[champ];
      return suivant;
    });
  };

  const afficherErreurs = (suivantes: Record<string, string>) => {
    setErreurs(suivantes);
    const premierChamp = Object.keys(suivantes)[0];
    if (premierChamp) requestAnimationFrame(() => document.getElementById(premierChamp)?.focus());
    return Object.keys(suivantes).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const suivantes: Record<string, string> = {};
    if (!form.prenom.trim()) suivantes["prenom-imp"] = "Le prénom est requis.";
    if (!form.nom.trim()) suivantes["nom-imp"] = "Le nom est requis.";
    if (!form.email.trim()) suivantes["email-imp"] = "L'adresse e-mail est requise.";
    else if (!emailValide(form.email)) suivantes["email-imp"] = "Saisissez une adresse e-mail valide.";
    if (!form.motivation.trim()) suivantes["motivation-imp"] = "La motivation est requise.";
    else if (form.motivation.trim().length < 20) suivantes["motivation-imp"] = "La motivation doit contenir au moins 20 caractères.";
    for (const question of questionsActives) {
      if (question.required && !form.reponses[question.id]) suivantes[`question-${question.id}`] = "Sélectionnez une réponse.";
    }
    if (!form.consentement) suivantes["consent-imp"] = "Votre consentement est requis pour envoyer la candidature.";
    if (!afficherErreurs(suivantes)) return;
    mutation.mutate({
      prenom: form.prenom, nom: form.nom, email: form.email, telephone: form.telephone || undefined,
      adresse: form.adresse || undefined, departement: form.departement || undefined, commune: form.commune || undefined,
      niveauEtude: form.niveauEtude || undefined, competences: form.competences || undefined,
      motivation: form.motivation, disponibilite: form.disponibilite || undefined,
      experienceAssociative: form.experienceAssociative || undefined, reponses: form.reponses,
      cv: form.cv ?? undefined, photo: form.photo ?? undefined,
      type: activeForm as RoleCandidature, consentement: form.consentement,
    });
  };

  const changerReponse = (question: QuestionCandidature, valeur: string, cochee: boolean) => {
    setForm(p => {
      if (!question.multiple) return { ...p, reponses: { ...p.reponses, [question.id]: valeur } };
      const choix = (p.reponses[question.id] ?? "").split("||").filter(Boolean);
      const prochain = cochee ? Array.from(new Set([...choix, valeur])) : choix.filter(x => x !== valeur);
      return { ...p, reponses: { ...p.reponses, [question.id]: prochain.join("||") } };
    });
    effacerErreur(`question-${question.id}`);
  };

  const handleSubmitPartenariat = (e: React.FormEvent) => {
    e.preventDefault();
    const suivantes: Record<string, string> = {};
    if (!formPrt.nomOrganisation.trim()) suivantes["prt-org"] = "Le nom de l'organisation est requis.";
    if (!formPrt.nomContact.trim()) suivantes["prt-contact"] = "La personne de contact est requise.";
    if (!formPrt.email.trim()) suivantes["prt-email"] = "L'adresse e-mail est requise.";
    else if (!emailValide(formPrt.email)) suivantes["prt-email"] = "Saisissez une adresse e-mail valide.";
    if (!formPrt.message.trim()) suivantes["prt-message"] = "Le message est requis.";
    else if (formPrt.message.trim().length < 20) suivantes["prt-message"] = "Le message doit contenir au moins 20 caractères.";
    if (!formPrt.consentement) suivantes["prt-consent"] = "Votre consentement est requis pour envoyer la demande.";
    if (!afficherErreurs(suivantes)) return;
    mutationPartenariat.mutate({
      nomOrganisation: formPrt.nomOrganisation,
      nomContact: formPrt.nomContact,
      fonction: formPrt.fonction || undefined,
      email: formPrt.email,
      telephone: formPrt.telephone || undefined,
      pays: formPrt.pays || undefined,
      typeOrganisation: formPrt.typeOrganisation || undefined,
      domaineCollaboration: formPrt.domaineCollaboration || undefined,
      projetConcerne: formPrt.projetConcerne || undefined,
      message: formPrt.message,
      consentement: formPrt.consentement,
    });
  };

  return (
    <PublicLayout>
      <SEOHead
        title="S'impliquer"
        description="Devenez membre, bénévole ou ambassadeur d'AJIHAD, ou proposez un partenariat institutionnel."
      />

      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="impliquer-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">S'impliquer</span>
          </nav>
          <div className="max-w-3xl">
            <h1 id="impliquer-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
              Rejoignez le <span className="text-[#4DBFBF]">mouvement AJIHAD</span>
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed">
              Il existe de nombreuses façons de contribuer à la mission d'AJIHAD. Choisissez celle qui correspond le mieux à vos aspirations et à vos disponibilités.
            </p>
          </div>
        </div>
      </section>

      {/* Formes d'implication */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading">Comment s'impliquer ?</h2>
            <p className="section-subheading mx-auto mt-4">Choisissez la forme d'implication qui vous correspond.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {liste("simpliquer_formes").slice(0, FORMES_TECHNIQUES.length).map((contenu, i) => {
              // L'identifiant et l'habillage restent techniques ; le titre, la
              // description et les avantages viennent de l'administration.
              const forme = { ...FORMES_TECHNIQUES[i], ...contenu } as
                (typeof FORMES_TECHNIQUES)[number] & Record<string, string>;
              const Icone = FORMES_TECHNIQUES[i].icon;
              return (
              <div key={forme.id} id={forme.id} className="bg-[#F6F8FB] dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${forme.color}15` }}>
                  <Icone className="w-6 h-6" style={{ color: forme.color }} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{forme.titre}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">{forme.description}</p>
                <ul className="space-y-1.5 mb-5">
                  {String(forme.avantages ?? "").split(/\r?\n/).filter(Boolean).map((av, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: forme.color }} />
                      {av}
                    </li>
                  ))}
                </ul>
                <button onClick={() => ouvrirFormulaire(forme.id)}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:scale-95 text-white"
                  style={{ backgroundColor: forme.color }}>
                  {forme.id === "partenariat" ? "Proposer un partenariat" : "Postuler"}
                </button>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section id="formulaire-implication" className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">
              {activeForm ? `Formulaire : ${liste("simpliquer_formes")[FORMES_TECHNIQUES.findIndex(f => f.id === activeForm)]?.titre}` : "Formulaire de candidature"}
            </h2>
            {!activeForm && <p className="section-subheading mx-auto mt-4">Sélectionnez une forme d'implication ci-dessus pour accéder au formulaire.</p>}
          </div>

          {!activeForm ? (
            <div className="text-center py-10">
              <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Choisissez une option ci-dessus pour accéder au formulaire.</p>
            </div>
          ) : submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                {estPartenariat ? "Demande de partenariat reçue !" : "Candidature reçue !"}
              </h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg mt-2">
                <span className="text-green-800 dark:text-green-300 font-mono font-bold text-sm">Référence : {reference}</span>
              </div>
              <p className="text-green-600 dark:text-green-500 text-sm mt-4">
                {estPartenariat
                  ? "Notre équipe examinera votre proposition et reviendra vers vous pour en discuter."
                  : "Notre équipe examinera votre candidature et vous contactera prochainement."}
              </p>
            </div>
          ) : estPartenariat ? (
            /* Formulaire dédié aux demandes de partenariat */
            <form onSubmit={handleSubmitPartenariat} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 space-y-6" noValidate>
              {Object.keys(erreurs).length > 0 && (
                <div id="implication-errors" role="alert" className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-1">Vérifiez les informations suivantes :</p>
                  <ul className="list-disc pl-5 space-y-1">{Object.values(erreurs).map(message => <li key={message}>{message}</li>)}</ul>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="prt-org" className={labelClass}>Nom de l'organisation *</label>
                  <input id="prt-org" type="text" required value={formPrt.nomOrganisation}
                    aria-invalid={Boolean(erreurs["prt-org"])} aria-describedby={erreurs["prt-org"] ? "implication-errors" : undefined}
                    onChange={e => { setFormPrt(p => ({ ...p, nomOrganisation: e.target.value })); effacerErreur("prt-org"); }}
                    className={`${inputClass} ${erreurs["prt-org"] ? "border-red-500 focus:ring-red-500" : ""}`} placeholder="Nom officiel de votre organisation" />
                </div>
                <div>
                  <label htmlFor="prt-contact" className={labelClass}>Personne de contact *</label>
                  <input id="prt-contact" type="text" required value={formPrt.nomContact}
                    aria-invalid={Boolean(erreurs["prt-contact"])} aria-describedby={erreurs["prt-contact"] ? "implication-errors" : undefined}
                    onChange={e => { setFormPrt(p => ({ ...p, nomContact: e.target.value })); effacerErreur("prt-contact"); }}
                    className={`${inputClass} ${erreurs["prt-contact"] ? "border-red-500 focus:ring-red-500" : ""}`} placeholder="Prénom et nom" />
                </div>
                <div>
                  <label htmlFor="prt-fonction" className={labelClass}>Fonction</label>
                  <input id="prt-fonction" type="text" value={formPrt.fonction}
                    onChange={e => setFormPrt(p => ({ ...p, fonction: e.target.value }))}
                    className={inputClass} placeholder="ex : Directrice des programmes" />
                </div>
                <div>
                  <label htmlFor="prt-email" className={labelClass}>Email *</label>
                  <input id="prt-email" type="email" required value={formPrt.email}
                    aria-invalid={Boolean(erreurs["prt-email"])} aria-describedby={erreurs["prt-email"] ? "implication-errors" : undefined}
                    onChange={e => { setFormPrt(p => ({ ...p, email: e.target.value })); effacerErreur("prt-email"); }}
                    className={`${inputClass} ${erreurs["prt-email"] ? "border-red-500 focus:ring-red-500" : ""}`} placeholder="contact@organisation.org" />
                </div>
                <div>
                  <label htmlFor="prt-tel" className={labelClass}>Téléphone</label>
                  <input id="prt-tel" type="tel" value={formPrt.telephone}
                    onChange={e => setFormPrt(p => ({ ...p, telephone: e.target.value }))}
                    className={inputClass} placeholder="+509 XXXX-XXXX" />
                </div>
                <div>
                  <label htmlFor="prt-pays" className={labelClass}>Pays</label>
                  <input id="prt-pays" type="text" value={formPrt.pays}
                    onChange={e => setFormPrt(p => ({ ...p, pays: e.target.value }))}
                    className={inputClass} placeholder="Haïti" />
                </div>
                <div>
                  <label htmlFor="prt-type" className={labelClass}>Type d'organisation</label>
                  <select id="prt-type" value={formPrt.typeOrganisation}
                    onChange={e => setFormPrt(p => ({ ...p, typeOrganisation: e.target.value }))}
                    className={inputClass}>
                    <option value="">Sélectionner…</option>
                    <option value="bailleur">Bailleur de fonds</option>
                    <option value="technique">Partenaire technique</option>
                    <option value="institutionnel">Institution publique</option>
                    <option value="ong">ONG / Association</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="diaspora">Organisation de la diaspora</option>
                    <option value="universite">Université / École</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prt-domaine" className={labelClass}>Domaine de collaboration</label>
                  <input id="prt-domaine" type="text" value={formPrt.domaineCollaboration}
                    onChange={e => setFormPrt(p => ({ ...p, domaineCollaboration: e.target.value }))}
                    className={inputClass} placeholder="ex : éducation, environnement" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="prt-projet" className={labelClass}>Projet concerné</label>
                  <input id="prt-projet" type="text" value={formPrt.projetConcerne}
                    onChange={e => setFormPrt(p => ({ ...p, projetConcerne: e.target.value }))}
                    className={inputClass} placeholder="ex : PROJEFA 2026" />
                </div>
              </div>
              <div>
                <label htmlFor="prt-message" className={labelClass}>Message *</label>
                <textarea id="prt-message" required rows={5} minLength={20} value={formPrt.message}
                  aria-invalid={Boolean(erreurs["prt-message"])} aria-describedby={erreurs["prt-message"] ? "implication-errors" : undefined}
                  onChange={e => { setFormPrt(p => ({ ...p, message: e.target.value })); effacerErreur("prt-message"); }}
                  className={`${inputClass} resize-none ${erreurs["prt-message"] ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="Décrivez la collaboration envisagée, vos objectifs et les ressources que vous pouvez mobiliser…" />
              </div>
              <div className="flex items-start gap-3">
                <input id="prt-consent" type="checkbox" checked={formPrt.consentement}
                  aria-invalid={Boolean(erreurs["prt-consent"])} aria-describedby={erreurs["prt-consent"] ? "implication-errors" : undefined}
                  onChange={e => { setFormPrt(p => ({ ...p, consentement: e.target.checked })); effacerErreur("prt-consent"); }}
                  className="mt-1 w-4 h-4 text-[#185FA5] rounded border-gray-300" />
                <label htmlFor="prt-consent" className="text-sm text-gray-600 dark:text-gray-400">
                  J'accepte la <Link href="/confidentialite" className="text-[#185FA5] underline">politique de confidentialité</Link> d'AJIHAD.
                </label>
              </div>
              <button type="submit" disabled={mutationPartenariat.isPending}
                className="w-full btn-primary-ajihad justify-center py-4 text-base disabled:opacity-60">
                {mutationPartenariat.isPending ? "Envoi en cours..." : "Envoyer ma demande de partenariat"}
                {!mutationPartenariat.isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 space-y-6" noValidate>
              <div>
                <label htmlFor="fonction-candidature" className={labelClass}>Je souhaite rejoindre AJIHAD comme *</label>
                <select id="fonction-candidature" value={activeForm} onChange={e => changerFonction(e.target.value)} className={inputClass}>
                  {FORMES_TECHNIQUES.filter(f => f.id !== "partenariat").map(forme => (
                    <option key={forme.id} value={forme.id}>{liste("simpliquer_formes")[FORMES_TECHNIQUES.findIndex(f => f.id === forme.id)]?.titre}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Les questions complémentaires s'adaptent automatiquement à votre choix.</p>
              </div>
              {Object.keys(erreurs).length > 0 && (
                <div id="implication-errors" role="alert" className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-1">Vérifiez les informations suivantes :</p>
                  <ul className="list-disc pl-5 space-y-1">{Object.values(erreurs).map(message => <li key={message}>{message}</li>)}</ul>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="prenom-imp" className={labelClass}>Prénom *</label>
                  <input id="prenom-imp" type="text" required value={form.prenom} aria-invalid={Boolean(erreurs["prenom-imp"])} aria-describedby={erreurs["prenom-imp"] ? "implication-errors" : undefined}
                    onChange={e => { setForm(p => ({ ...p, prenom: e.target.value })); effacerErreur("prenom-imp"); }}
                    className={`${inputClass} ${erreurs["prenom-imp"] ? "border-red-500 focus:ring-red-500" : ""}`} placeholder="Prénom" />
                </div>
                <div>
                  <label htmlFor="nom-imp" className={labelClass}>Nom *</label>
                  <input id="nom-imp" type="text" required value={form.nom} aria-invalid={Boolean(erreurs["nom-imp"])} aria-describedby={erreurs["nom-imp"] ? "implication-errors" : undefined}
                    onChange={e => { setForm(p => ({ ...p, nom: e.target.value })); effacerErreur("nom-imp"); }}
                    className={`${inputClass} ${erreurs["nom-imp"] ? "border-red-500 focus:ring-red-500" : ""}`} placeholder="Nom" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email-imp" className={labelClass}>Email *</label>
                  <input id="email-imp" type="email" required value={form.email} aria-invalid={Boolean(erreurs["email-imp"])} aria-describedby={erreurs["email-imp"] ? "implication-errors" : undefined}
                    onChange={e => { setForm(p => ({ ...p, email: e.target.value })); effacerErreur("email-imp"); }}
                    className={`${inputClass} ${erreurs["email-imp"] ? "border-red-500 focus:ring-red-500" : ""}`} placeholder="votre@email.com" />
                </div>
                <div>
                  <label htmlFor="tel-imp" className={labelClass}>Téléphone</label>
                  <input id="tel-imp" type="tel" value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                    className={inputClass} placeholder="+509 XXXX-XXXX" />
                </div>
              </div>
              <div>
                <label htmlFor="adresse-imp" className={labelClass}>Adresse</label>
                <input id="adresse-imp" type="text" value={form.adresse}
                  onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))}
                  className={inputClass} placeholder="Adresse complète (optionnel)" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="departement-imp" className={labelClass}>Département</label>
                  <input id="departement-imp" type="text" value={form.departement}
                    onChange={e => setForm(p => ({ ...p, departement: e.target.value }))}
                    className={inputClass} placeholder="ex : Artibonite" />
                </div>
                <div>
                  <label htmlFor="commune-imp" className={labelClass}>Commune</label>
                  <input id="commune-imp" type="text" value={form.commune}
                    onChange={e => setForm(p => ({ ...p, commune: e.target.value }))}
                    className={inputClass} placeholder="ex : Gonaïves" />
                </div>
                <div>
                  <label htmlFor="niveau-imp" className={labelClass}>Niveau d'étude</label>
                  <input id="niveau-imp" type="text" value={form.niveauEtude}
                    onChange={e => setForm(p => ({ ...p, niveauEtude: e.target.value }))}
                    className={inputClass} placeholder="ex : Licence" />
                </div>
                <div>
                  <label htmlFor="disponibilite-imp" className={labelClass}>Disponibilités</label>
                  <input id="disponibilite-imp" type="text" value={form.disponibilite}
                    onChange={e => setForm(p => ({ ...p, disponibilite: e.target.value }))}
                    className={inputClass} placeholder="ex : Soirs et week-ends" />
                </div>
              </div>
              <div>
                <label htmlFor="competences-imp" className={labelClass}>Compétences</label>
                <textarea id="competences-imp" rows={3} value={form.competences}
                  onChange={e => setForm(p => ({ ...p, competences: e.target.value }))}
                  className={`${inputClass} resize-none`} placeholder="Compétences, outils ou domaines d'expertise" />
              </div>
              <div>
                <label htmlFor="experience-imp" className={labelClass}>Expérience associative</label>
                <textarea id="experience-imp" rows={3} value={form.experienceAssociative}
                  onChange={e => setForm(p => ({ ...p, experienceAssociative: e.target.value }))}
                  className={`${inputClass} resize-none`} placeholder="Expériences bénévoles ou associatives (optionnel)" />
              </div>
              <div>
                <label htmlFor="motivation-imp" className={labelClass}>Motivation * <span className="font-normal text-gray-500">(20 caractères minimum)</span></label>
                <textarea id="motivation-imp" required minLength={20} rows={5} value={form.motivation} aria-invalid={Boolean(erreurs["motivation-imp"])} aria-describedby={erreurs["motivation-imp"] ? "implication-errors" : undefined}
                  onChange={e => { setForm(p => ({ ...p, motivation: e.target.value })); effacerErreur("motivation-imp"); }}
                  className={`${inputClass} resize-none ${erreurs["motivation-imp"] ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="Expliquez votre motivation et comment vous souhaitez contribuer à AJIHAD..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cv-imp" className={labelClass}>CV <span className="font-normal text-gray-500">(PDF, facultatif)</span></label>
                  <input id="cv-imp" type="file" accept="application/pdf,.pdf" onChange={e => choisirPieceJointe("cv", e.target.files?.[0])}
                    className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-[#185FA5] hover:file:bg-blue-100" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PDF uniquement, 5 Mo maximum.</p>
                  {form.cv && (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-xs text-[#185FA5]">
                      <span className="truncate" title={form.cv.name}>{form.cv.name} - {tailleLisible(form.cv.size)}</span>
                      <button type="button" onClick={() => setForm(p => ({ ...p, cv: null }))} className="font-semibold hover:underline" aria-label="Retirer le CV">Retirer</button>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="photo-imp" className={labelClass}>Photo <span className="font-normal text-gray-500">(facultative)</span></label>
                  <input id="photo-imp" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => choisirPieceJointe("photo", e.target.files?.[0])}
                    className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-[#247f80] hover:file:bg-teal-100" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG ou WebP, 3 Mo maximum.</p>
                  {form.photo && (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 px-3 py-2 text-xs text-[#247f80]">
                      <span className="truncate" title={form.photo.name}>{form.photo.name} - {tailleLisible(form.photo.size)}</span>
                      <button type="button" onClick={() => setForm(p => ({ ...p, photo: null }))} className="font-semibold hover:underline" aria-label="Retirer la photo">Retirer</button>
                    </div>
                  )}
                </div>
              </div>

              <fieldset className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-5" aria-labelledby="questions-candidature-titre">
                <legend id="questions-candidature-titre" className="text-base font-bold text-gray-900 dark:text-white">Quelques questions sur votre engagement</legend>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ces reponses structurent l'etude de votre candidature et peuvent etre ajustees par l'equipe.</p>
                {questionsActives.map(question => {
                  const reponses = (form.reponses[question.id] ?? "").split("||").filter(Boolean);
                  const erreur = erreurs[`question-${question.id}`];
                  return (
                    <div key={question.id}>
                      <p id={`question-${question.id}-label`} className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        {question.label} {question.required && <span aria-hidden="true">*</span>}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role={question.multiple ? "group" : undefined} aria-labelledby={`question-${question.id}-label`} aria-describedby={erreur ? `question-${question.id}-error` : undefined}>
                        {question.options.map((option, index) => {
                          const inputId = `question-${question.id}-${index}`;
                          const cochee = reponses.includes(option);
                          return (
                            <label key={option} htmlFor={inputId} className="flex items-start gap-2 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:border-[#4DBFBF] cursor-pointer">
                              <input id={inputId} type={question.multiple ? "checkbox" : "radio"} name={`question-${question.id}`} value={option} checked={cochee}
                                onChange={e => changerReponse(question, option, e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-[#185FA5] border-gray-300" />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                      {erreur && <p id={`question-${question.id}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400 mt-2">{erreur}</p>}
                    </div>
                  );
                })}
              </fieldset>

              <div className="flex items-start gap-3">
                <input id="consent-imp" type="checkbox" checked={form.consentement} aria-invalid={Boolean(erreurs["consent-imp"])} aria-describedby={erreurs["consent-imp"] ? "implication-errors" : undefined}
                  onChange={e => { setForm(p => ({ ...p, consentement: e.target.checked })); effacerErreur("consent-imp"); }}
                  className="mt-1 w-4 h-4 text-[#185FA5] rounded border-gray-300" />
                <label htmlFor="consent-imp" className="text-sm text-gray-600 dark:text-gray-400">
                  J'accepte la <Link href="/confidentialite" className="text-[#185FA5] underline">politique de confidentialité</Link> d'AJIHAD.
                </label>
              </div>
              <button type="submit" disabled={mutation.isPending}
                className="w-full btn-primary-ajihad justify-center py-4 text-base disabled:opacity-60">
                {mutation.isPending ? "Envoi en cours..." : "Soumettre ma candidature"}
                {!mutation.isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
