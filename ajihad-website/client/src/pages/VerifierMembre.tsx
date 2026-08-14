import { Link, useSearch } from "wouter";
import { CheckCircle2, XCircle, Loader2, ShieldQuestion, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";

const STATUTS: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente de validation", color: "text-amber-600 dark:text-amber-400" },
  verifie: { label: "Vérifié", color: "text-blue-600 dark:text-blue-400" },
  approuve: { label: "Approuvé", color: "text-blue-600 dark:text-blue-400" },
  refuse: { label: "Refusé", color: "text-red-600 dark:text-red-400" },
  actif: { label: "Membre actif", color: "text-green-600 dark:text-green-400" },
  inactif: { label: "Inactif", color: "text-gray-500 dark:text-gray-400" },
};

const TYPES: Record<string, string> = {
  membre: "Membre",
  benevole: "Bénévole",
  ambassadeur: "Ambassadeur",
};

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-[#185FA5] dark:text-blue-400 font-extrabold text-xl tracking-wider">AJIHAD</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Vérification de carte de membre</p>
        </div>
        {children}
        <Link href="/"
          className="mt-6 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm hover:text-[#185FA5] dark:hover:text-blue-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function VerifierMembre() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const openId = params.get("id") ?? "";
  const num = params.get("num") ?? "";
  const parametresPresents = Boolean(openId && num);

  const { data, isLoading, isError } = trpc.verifierMembre.useQuery(
    { openId, num },
    { enabled: parametresPresents, retry: false }
  );

  if (!parametresPresents) {
    return (
      <>
        <SEOHead title="Vérification de carte de membre" description="Vérifiez l'authenticité d'une carte de membre AJIHAD." noIndex />
        <Cadre>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <ShieldQuestion className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune carte à vérifier</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Scannez le QR code figurant sur une carte de membre AJIHAD pour en vérifier l'authenticité.
            </p>
          </div>
        </Cadre>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <SEOHead title="Vérification en cours" description="Vérification d'une carte de membre AJIHAD." noIndex />
        <Cadre>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center">
            <Loader2 className="w-10 h-10 text-[#185FA5] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Vérification de la carte en cours…</p>
          </div>
        </Cadre>
      </>
    );
  }

  const valide = !isError && data?.valide === true;

  if (!valide) {
    return (
      <>
        <SEOHead title="Carte non reconnue" description="Cette carte de membre AJIHAD n'a pas pu être vérifiée." noIndex />
        <Cadre>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-red-500 py-8 text-center">
              <XCircle className="w-16 h-16 text-white mx-auto" />
            </div>
            <div className="p-8 text-center">
              <h1 className="text-xl font-extrabold text-red-600 dark:text-red-400 mb-2">Carte non reconnue</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Cette carte n'est pas reconnue par le registre officiel d'AJIHAD. Elle peut être expirée, révoquée ou non authentique.
              </p>
              <div className="p-3 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                <p className="text-gray-400 dark:text-gray-500 text-xs">Numéro scanné</p>
                <p className="font-mono text-gray-700 dark:text-gray-200 text-sm">{num}</p>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-5">
                En cas de doute, contactez AJIHAD à <a href="mailto:contact@ajihad.org" className="underline">contact@ajihad.org</a>.
              </p>
            </div>
          </div>
        </Cadre>
      </>
    );
  }

  const statut = STATUTS[data.statut] ?? STATUTS.en_attente;

  return (
    <>
      <SEOHead title="Carte de membre vérifiée" description="Cette carte de membre AJIHAD est authentique." noIndex />
      <Cadre>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#4DBFBF] py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-white mx-auto" />
          </div>
          <div className="p-8">
            <h1 className="text-xl font-extrabold text-[#2b8f8f] dark:text-[#4DBFBF] text-center mb-6">
              Carte authentique
            </h1>

            <dl className="space-y-3">
              <div className="p-3 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                <dt className="text-gray-400 dark:text-gray-500 text-xs">Nom du membre</dt>
                <dd className="font-bold text-gray-900 dark:text-white">{data.nom}</dd>
              </div>
              <div className="p-3 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                <dt className="text-gray-400 dark:text-gray-500 text-xs">N° de membre</dt>
                <dd className="font-mono font-bold text-gray-900 dark:text-white tracking-wider">{data.numero}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                  <dt className="text-gray-400 dark:text-gray-500 text-xs">Statut</dt>
                  <dd className={`font-semibold text-sm ${statut.color}`}>{statut.label}</dd>
                </div>
                <div className="p-3 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                  <dt className="text-gray-400 dark:text-gray-500 text-xs">Catégorie</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white text-sm">
                    {TYPES[data.typeMembre] ?? "Membre"}
                  </dd>
                </div>
              </div>
              {data.dateAdhesion && (
                <div className="p-3 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                  <dt className="text-gray-400 dark:text-gray-500 text-xs">Membre depuis</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white text-sm">
                    {new Date(data.dateAdhesion).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" })}
                  </dd>
                </div>
              )}
            </dl>

            <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-6 leading-relaxed">
              Vérification effectuée le {new Date().toLocaleString("fr-HT")} auprès du registre officiel de l'Association
              des Jeunes Intellectuels Haïtiens pour l'Avenir et le Développement.
            </p>
          </div>
        </div>
      </Cadre>
    </>
  );
}
