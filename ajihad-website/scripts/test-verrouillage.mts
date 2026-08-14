/**
 * Vérifie le comportement du verrou anti-force-brute après expiration.
 *
 * Scénario reproduit : un compte a atteint les 5 échecs, le blocage de 15 min
 * s'est écoulé, la personne se trompe une fois de plus.
 *
 * Attendu : le compteur repart à 1 et le compte n'est PAS re-bloqué — elle
 * dispose à nouveau de ses 5 tentatives.
 *
 * Avant correction : le compteur passait de 5 à 6, donc au-dessus du seuil,
 * et le compte était re-bloqué immédiatement pour 15 minutes.
 *
 * Usage : npx tsx scripts/test-verrouillage.mts
 * Le compte de test est créé puis supprimé ; aucun compte réel n'est touché.
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import { hacherMotDePasse, genererOpenId } from "../server/_core/auth.js";

const BASE_PRODUCTION = "HEH84CG4kUiHWDc7rSb6KT";
const EMAIL_TEST = "test-verrouillage@ajihad.invalid";
const PORT = process.env.PORT ?? "3000";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL absente"); process.exit(1); }
const base = new URL(url).pathname.replace(/^\//, "");
if (base === BASE_PRODUCTION) { console.error("REFUS : base de production."); process.exit(1); }

const cx = await mysql.createConnection({ uri: url, ssl: { rejectUnauthorized: true } });

async function nettoyer() {
  await cx.execute("DELETE FROM users WHERE email = ?", [EMAIL_TEST]);
}

async function etat() {
  const [l] = await cx.execute<any[]>(
    "SELECT echecsConnexion, bloqueJusqua FROM users WHERE email = ?", [EMAIL_TEST]);
  return l[0];
}

async function tenter(motDePasse: string) {
  const r = await fetch(`http://localhost:${PORT}/api/trpc/auth.connexion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: { email: EMAIL_TEST, motDePasse } }),
  });
  const d: any = await r.json();
  return d?.error?.json?.message ?? (d?.result?.data?.json?.success ? "connexion réussie" : JSON.stringify(d));
}

let echecs = 0;
const verifier = (nom: string, obtenu: unknown, attendu: unknown) => {
  const ok = JSON.stringify(obtenu) === JSON.stringify(attendu);
  if (!ok) echecs++;
  console.log(`  ${ok ? "OK  " : "ECHEC"} ${nom} — obtenu ${JSON.stringify(obtenu)}, attendu ${JSON.stringify(attendu)}`);
};

await nettoyer();
await cx.execute(
  `INSERT INTO users (openId, email, name, role, motDePasseHash, echecsConnexion, bloqueJusqua)
   VALUES (?, ?, 'Compte de test', 'user', ?, 5, ?)`,
  [genererOpenId(), EMAIL_TEST, await hacherMotDePasse("bonMotDePasse123"),
   new Date(Date.now() - 60_000)],  // blocage expiré il y a une minute
);
console.log("  compte de test : 5 échecs, blocage expiré depuis 1 minute\n");

// 1. Une erreur de plus après expiration ne doit PAS re-bloquer.
const msg1 = await tenter("mauvais");
verifier("message après 1 erreur post-expiration", /Trop de tentatives/.test(msg1), false);
const e1 = await etat();
verifier("compteur remis à 1", e1.echecsConnexion, 1);
verifier("aucun nouveau blocage", e1.bloqueJusqua, null);

// 2. Le bon mot de passe passe toujours.
const msg2 = await tenter("bonMotDePasse123");
verifier("connexion avec le bon mot de passe", msg2, "connexion réussie");
const e2 = await etat();
verifier("compteur purgé après succès", e2.echecsConnexion, 0);

// 3. Le seuil fonctionne toujours : 5 erreurs d'affilée doivent bloquer.
for (let i = 0; i < 5; i++) await tenter("mauvais");
const e3 = await etat();
verifier("blocage après 5 erreurs consécutives", e3.bloqueJusqua !== null, true);
const msg3 = await tenter("bonMotDePasse123");
verifier("bon mot de passe refusé pendant le blocage", /Trop de tentatives/.test(msg3), true);

await nettoyer();
await cx.end();
console.log(`\n  ${echecs === 0 ? "Tous les cas passent." : echecs + " cas en échec."}`);
process.exit(echecs === 0 ? 0 : 1);
