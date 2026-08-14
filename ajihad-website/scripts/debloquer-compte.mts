/**
 * Lève le blocage anti-force-brute d'un compte et vérifie un mot de passe.
 *
 * Après 5 échecs, `auth.connexion` bloque le compte 15 minutes. Le verrou
 * répond AVANT la vérification du mot de passe : tant qu'il est actif, on ne
 * peut pas savoir si le mot de passe saisi était correct. Ce script tranche.
 *
 * Usage :
 *   npx tsx scripts/debloquer-compte.mts [motDePasseATester] [email]
 *
 * Ne touche jamais au mot de passe : il diagnostique, puis remet à zéro le
 * compteur d'échecs et la date de blocage. Refuse de s'exécuter sur la base
 * de production.
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import { verifierMotDePasse } from "../server/_core/auth.js";

const BASE_PRODUCTION = "HEH84CG4kUiHWDc7rSb6KT";

const motDePasseATester = process.argv[2];
const email = process.argv[3] ?? process.env.ADMIN_EMAIL;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL absente de .env");
  process.exit(1);
}
if (!email) {
  console.error("Aucun e-mail : passez-le en argument ou renseignez ADMIN_EMAIL.");
  process.exit(1);
}

const base = new URL(url).pathname.replace(/^\//, "");
if (base === BASE_PRODUCTION) {
  console.error("REFUS : base de production. Créez une base distincte pour le développement.");
  process.exit(1);
}
console.log(`  base   : ${base}`);

const cx = await mysql.createConnection({ uri: url, ssl: { rejectUnauthorized: true } });

const [lignes] = await cx.execute<any[]>(
  "SELECT id, email, name, role, motDePasseHash, echecsConnexion, bloqueJusqua FROM users WHERE email = ? LIMIT 1",
  [email],
);
const u = lignes[0];
if (!u) {
  console.error(`  aucun compte pour ${email}`);
  await cx.end();
  process.exit(1);
}

const bloque = u.bloqueJusqua && new Date(u.bloqueJusqua) > new Date();
console.log(`  compte : ${u.name} <${u.email}> — rôle ${u.role}`);
console.log(`  échecs : ${u.echecsConnexion ?? 0}`);
console.log(`  bloqué : ${bloque ? `oui, jusqu'à ${new Date(u.bloqueJusqua).toISOString()}` : "non"}`);
console.log(`  mot de passe défini : ${u.motDePasseHash ? "oui" : "NON — le compte ne peut pas se connecter"}`);

let valide: boolean | null = null;
if (motDePasseATester && u.motDePasseHash) {
  valide = await verifierMotDePasse(motDePasseATester, u.motDePasseHash);
  console.log(`\n  mot de passe testé : ${valide ? "CORRECT" : "INCORRECT"}`);
}

if (bloque || (u.echecsConnexion ?? 0) > 0) {
  await cx.execute("UPDATE users SET echecsConnexion = 0, bloqueJusqua = NULL WHERE id = ?", [u.id]);
  console.log("\n  -> blocage levé, compteur d'échecs remis à zéro");
} else {
  console.log("\n  -> rien à lever, le compte n'était pas bloqué");
}

await cx.end();
process.exit(valide === false ? 2 : 0);
