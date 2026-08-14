/**
 * Initialise la base de données AJIHAD.
 *
 *   npx tsx scripts/init-base.mts
 *
 * Enchaîne, dans l'ordre :
 *   1. vérification de la connexion ;
 *   2. application des migrations Drizzle ;
 *   3. contrôle des tables attendues ;
 *   4. création du premier compte administrateur si la base est vierge.
 *
 * Le quatrième point est indispensable : l'inscription libre étant fermée,
 * une base neuve n'aurait aucun compte et l'administration serait inatteignable.
 *
 * Le script est réexécutable sans danger : il ne recrée rien qui existe déjà.
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import { randomBytes, scrypt as scryptCb } from "crypto";
import { promisify } from "util";
import { readdirSync, readFileSync } from "fs";
import path from "path";

const scrypt = promisify(scryptCb) as (m: string, s: Buffer, l: number) => Promise<Buffer>;

const URL_BASE = process.env.DATABASE_URL;
const EMAIL_ADMIN = process.env.ADMIN_EMAIL?.trim().toLowerCase();

const TABLES_ATTENDUES = [
  "users", "membres", "projets", "actualites", "indicateurs", "partenaires",
  "documents", "formulaires_contact", "candidatures", "contributions",
  "demandes_partenariat", "journal_audit", "notifications", "parametres",
];

function arreter(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/** Même format que server/_core/auth.ts : scrypt$sel$empreinte. */
async function hacher(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const empreinte = await scrypt(motDePasse.normalize("NFKC"), sel, 64);
  return `scrypt$${sel.toString("hex")}$${empreinte.toString("hex")}`;
}

/** Mot de passe dictable : trois syllabes et quatre chiffres. */
function genererMotDePasse(): string {
  const syllabes = ["ba", "ke", "li", "mo", "nu", "ra", "so", "ti", "va", "ze", "ja", "fo"];
  const o = randomBytes(4);
  const mot = Array.from(o.subarray(0, 3), b => syllabes[b % syllabes.length]).join("");
  return `${mot}${1000 + (o[3] * 31) % 9000}`;
}

if (!URL_BASE) {
  arreter(
    "DATABASE_URL n'est pas défini.\n" +
    "  Ajoutez-le dans .env, puis relancez :\n" +
    "    DATABASE_URL=mysql://utilisateur:motdepasse@hote:4000/ajihad_dev"
  );
}

console.log("→ Connexion à la base...");
let cx: mysql.Connection;
try {
  cx = await mysql.createConnection({
    uri: URL_BASE,
    ssl: URL_BASE.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  });
  await cx.query("SELECT 1");
} catch (e: any) {
  arreter(`Connexion impossible : ${e.message}`);
}

const [[{ base }]] = (await cx.query("SELECT DATABASE() AS base")) as any;
console.log(`  connecté à « ${base} »`);

// Garde-fou : refuser d'agir sur la base de production Manus par inadvertance.
if (base === "HEH84CG4kUiHWDc7rSb6KT") {
  await cx.end();
  arreter(
    "Cette base est celle du déploiement Manus d'origine.\n" +
    "  Créez une base distincte pour éviter d'écrire dans vos données en ligne."
  );
}

// ---------------------------------------------------------------- migrations

console.log("\n→ Application des migrations...");
const dossier = path.resolve(import.meta.dirname, "..", "drizzle");
const fichiers = readdirSync(dossier).filter(f => f.endsWith(".sql")).sort();

await cx.query(`
  CREATE TABLE IF NOT EXISTS __migrations (
    nom VARCHAR(255) PRIMARY KEY,
    appliquee_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
const [dejaFaites] = (await cx.query("SELECT nom FROM __migrations")) as any;
const connues = new Set(dejaFaites.map((r: any) => r.nom));

for (const fichier of fichiers) {
  if (connues.has(fichier)) {
    console.log(`  ${fichier} — déjà appliquée`);
    continue;
  }
  const sql = readFileSync(path.join(dossier, fichier), "utf-8");
  const instructions = sql
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(Boolean);

  let posees = 0;
  for (const instruction of instructions) {
    try {
      await cx.query(instruction);
      posees++;
    } catch (e: any) {
      // Colonne ou table déjà présente : la migration a été appliquée
      // partiellement ailleurs, ce n'est pas une erreur bloquante.
      if (/Duplicate column|already exists/i.test(e.message)) continue;
      await cx.end();
      arreter(`${fichier} : ${e.message}`);
    }
  }
  await cx.query("INSERT INTO __migrations (nom) VALUES (?)", [fichier]);
  console.log(`  ${fichier} — ${posees} instruction(s) appliquée(s)`);
}

// ---------------------------------------------------------------- contrôle

console.log("\n→ Contrôle des tables...");
const [tables] = (await cx.query("SHOW TABLES")) as any;
const presentes = new Set(tables.map((t: any) => Object.values(t)[0] as string));
const manquantes = TABLES_ATTENDUES.filter(t => !presentes.has(t));

if (manquantes.length) {
  await cx.end();
  arreter(`Tables manquantes : ${manquantes.join(", ")}`);
}
console.log(`  ${TABLES_ATTENDUES.length} tables présentes`);

// ---------------------------------------------------------------- amorçage

console.log("\n→ Compte administrateur...");
const [[{ total }]] = (await cx.query("SELECT COUNT(*) AS total FROM users")) as any;

if (total > 0) {
  console.log(`  ${total} compte(s) déjà présent(s) — rien à créer`);
} else if (!EMAIL_ADMIN) {
  console.log(
    "  Base vierge et ADMIN_EMAIL non défini.\n" +
    "  Ajoutez ADMIN_EMAIL=vous@exemple.org dans .env puis relancez ce script."
  );
} else {
  const motDePasse = genererMotDePasse();
  await cx.query(
    `INSERT INTO users (openId, name, email, loginMethod, motDePasseHash, role, echecsConnexion)
     VALUES (?, ?, ?, 'mot_de_passe', ?, 'super_admin', 0)`,
    [randomBytes(16).toString("base64url"), "Administrateur AJIHAD", EMAIL_ADMIN, await hacher(motDePasse)]
  );
  console.log("\n  ┌──────────────────────────────────────────────");
  console.log("  │  Compte super administrateur créé");
  console.log(`  │  Adresse     : ${EMAIL_ADMIN}`);
  console.log(`  │  Mot de passe: ${motDePasse}`);
  console.log("  │  Changez-le après la première connexion.");
  console.log("  └──────────────────────────────────────────────");
}

await cx.end();
console.log("\n✓ Base prête. Démarrez le site : npm run dev\n");
