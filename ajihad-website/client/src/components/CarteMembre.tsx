import { CreditCard, CheckCircle } from "lucide-react";
import { useConfigSite } from "@/hooks/useConfigSite";

export type DonneesCarte = {
  nom: string;
  email: string | null;
  numero: string;
  openId: string;
  annee: number | string;
  typeMembre?: string | null;
  statut?: string | null;
};

const LIBELLE_TYPE: Record<string, string> = {
  membre: "Membre",
  benevole: "Bénévole",
  ambassadeur: "Ambassadeur",
};

function QR({ valeur, taille }: { valeur: string; taille: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${taille}x${taille}&data=${encodeURIComponent(valeur)}&color=042C53&bgcolor=FFFFFF&qzone=2`;
  return (
    <img
      src={url}
      alt="QR code de vérification de la carte"
      width={taille}
      height={taille}
      className="rounded block"
      loading="lazy"
      onError={e => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}

/**
 * Carte de membre. Couleurs, mention et éléments affichés viennent de
 * /admin/parametres : l'apparence se règle sans toucher au code.
 */
export default function CarteMembre({ donnees }: { donnees: DonneesCarte }) {
  const { texte, visible } = useConfigSite();

  const debut = texte("carte_couleur_debut") || "#042C53";
  const fin = texte("carte_couleur_fin") || "#185FA5";
  const accent = texte("carte_couleur_accent") || "#4DBFBF";
  const lienVerif = `${window.location.origin}/verifier-membre?id=${donnees.openId}&num=${donnees.numero}`;
  const actif = donnees.statut === "actif";

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        className="relative rounded-2xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${debut} 0%, ${fin} 100%)`, aspectRatio: "1.586/1" }}
      >
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ backgroundColor: accent }} />
          <div className="absolute -bottom-14 -left-14 w-36 h-36 rounded-full bg-white" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-extrabold text-base sm:text-lg tracking-wider" style={{ color: accent }}>
                AJIHAD
              </div>
              <div className="text-white/60 text-[10px] sm:text-xs truncate">{texte("carte_mention")}</div>
            </div>
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4" style={{ color: accent }} />
            </div>
          </div>

          <div className="flex items-end gap-3 min-w-0">
            {visible("carte_afficher_photo") && (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0"
                style={{ backgroundColor: `${accent}30`, color: accent }}
                aria-hidden="true"
              >
                {donnees.nom.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-white/50 text-[10px] mb-0.5">
                {LIBELLE_TYPE[donnees.typeMembre ?? "membre"] ?? "Membre"}
              </div>
              <div className="font-bold text-base sm:text-lg leading-tight truncate">{donnees.nom}</div>
              {donnees.email && (
                <div className="text-blue-100/70 text-xs truncate">{donnees.email}</div>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-white/50 text-[10px] mb-0.5">N° de membre</div>
              <div className="font-mono font-bold text-xs sm:text-sm tracking-wider truncate" style={{ color: accent }}>
                {donnees.numero}
              </div>
              <div className="text-white/50 text-[10px] mt-1">Membre depuis {donnees.annee}</div>
            </div>
            {visible("carte_afficher_qr") && (
              <div className="bg-white p-1 rounded-lg flex-shrink-0">
                <QR valeur={lienVerif} taille={56} />
              </div>
            )}
          </div>
        </div>
      </div>

      {actif && (
        <div
          className="absolute -top-2 -right-2 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
          style={{ backgroundColor: accent }}
        >
          <CheckCircle className="w-3 h-3" /> Actif
        </div>
      )}
    </div>
  );
}
