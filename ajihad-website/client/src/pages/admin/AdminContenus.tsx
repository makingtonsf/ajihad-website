import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import {
  Save, Plus, Trash2, Eye, EyeOff, RotateCcw, LayoutList, TriangleAlert, GripVertical,
} from "lucide-react";
import {
  LISTES_CONTENU, SECTIONS_SITE, TEXTES_SITE, contenusParDefaut, lireListe,
  sectionsParDefaut, textesParDefaut, type ListeContenu,
} from "@shared/contenusSite";
import { estVrai } from "@shared/configSite";
import { TITRE_CARTE, TITRE_PAGE } from "@/lib/typographie";

const champCss =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";

function Interrupteur({ actif, onChange, id, libelle }: {
  actif: boolean; onChange: (v: boolean) => void; id: string; libelle: string;
}) {
  return (
    <button type="button" id={id} role="switch" aria-checked={actif} aria-label={libelle}
      onClick={() => onChange(!actif)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        actif ? "bg-[#185FA5]" : "bg-gray-300 dark:bg-gray-600"
      }`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
        actif ? "translate-x-5" : "translate-x-0.5"
      }`} />
    </button>
  );
}

/** Éditeur d'une liste : ajout, modification, réordonnancement, suppression. */
function EditeurListe({ definition, entrees, onChange }: {
  definition: ListeContenu;
  entrees: Record<string, string>[];
  onChange: (v: Record<string, string>[]) => void;
}) {
  const maj = (i: number, cle: string, v: string) =>
    onChange(entrees.map((e, j) => (j === i ? { ...e, [cle]: v } : e)));

  const deplacer = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= entrees.length) return;
    const copie = [...entrees];
    [copie[i], copie[j]] = [copie[j], copie[i]];
    onChange(copie);
  };

  const vide = Object.fromEntries(definition.champs.map(c => [c.cle, ""]));

  return (
    <div className="space-y-3">
      {entrees.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
          Aucune entrée. La section n'affichera rien.
        </p>
      )}

      {entrees.map((entree, i) => (
        <div key={i} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
                className="text-gray-400 hover:text-[#185FA5] disabled:opacity-30 text-xs leading-none"
                aria-label={`Monter l'entrée ${i + 1}`}>▲</button>
              <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500" aria-hidden="true" />
              <button type="button" onClick={() => deplacer(i, 1)} disabled={i === entrees.length - 1}
                className="text-gray-400 hover:text-[#185FA5] disabled:opacity-30 text-xs leading-none"
                aria-label={`Descendre l'entrée ${i + 1}`}>▼</button>
            </div>
            <span className="text-xl font-extrabold text-gray-200 dark:text-gray-600 leading-none pt-1 w-7 text-right">
              {i + 1}
            </span>
            <div className="flex-1 space-y-2 min-w-0">
              {definition.champs.map(c => (
                <div key={c.cle}>
                  <label htmlFor={`${definition.cle}-${i}-${c.cle}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {c.libelle}
                  </label>
                  {c.type === "texte_long" ? (
                    <textarea id={`${definition.cle}-${i}-${c.cle}`} rows={2} value={entree[c.cle] ?? ""}
                      onChange={e => maj(i, c.cle, e.target.value)} className={`${champCss} resize-none`} />
                  ) : (
                    <input id={`${definition.cle}-${i}-${c.cle}`} type="text" value={entree[c.cle] ?? ""}
                      onChange={e => maj(i, c.cle, e.target.value)} className={champCss} />
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onChange(entrees.filter((_, j) => j !== i))}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
              aria-label={`Supprimer l'entrée ${i + 1}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange([...entrees, vide])}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#185FA5] border border-dashed border-[#185FA5] rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
        <button type="button" onClick={() => onChange(definition.defaut)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <RotateCcw className="w-4 h-4" /> Rétablir le contenu d'origine
        </button>
      </div>
    </div>
  );
}

export default function AdminContenus() {
  const { data: enregistres, refetch } = trpc.admin.parametres.list.useQuery();
  const { data: demo } = trpc.admin.modeDemo.useQuery();
  const utils = trpc.useUtils();

  const [valeurs, setValeurs] = useState<Record<string, string>>(() => ({
    ...sectionsParDefaut(),
    ...contenusParDefaut(),
    ...textesParDefaut(),
  }));
  const [initialise, setInitialise] = useState(false);
  const [ongletPage, setOngletPage] = useState("Accueil");

  useEffect(() => {
    if (!enregistres || initialise) return;
    const base = { ...sectionsParDefaut(), ...contenusParDefaut(), ...textesParDefaut() };
    for (const p of enregistres) {
      if (p.cle && p.valeur !== null && p.cle in base) base[p.cle] = p.valeur;
    }
    setValeurs(base);
    setInitialise(true);
  }, [enregistres, initialise]);

  const enregistrer = trpc.admin.parametres.updateMany.useMutation({
    onSuccess: async () => {
      toast.success("Contenus enregistrés. Le site public est à jour.");
      await utils.public.configSite.invalidate();
      refetch();
    },
    onError: (e: any) => toast.error(`Erreur : ${e.message}`),
  });

  const pages = useMemo(
    () => Array.from(new Set([
      ...SECTIONS_SITE.map(s => s.page),
      ...LISTES_CONTENU.map(l => l.page),
      ...TEXTES_SITE.map(t => t.page),
    ])),
    []
  );

  const sectionsPage = SECTIONS_SITE.filter(s => s.page === ongletPage);
  const listesPage = LISTES_CONTENU.filter(l => l.page === ongletPage);
  const textesPage = TEXTES_SITE.filter(t => t.page === ongletPage);

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    enregistrer.mutate({
      valeurs: Object.entries(valeurs).map(([cle, valeur]) => ({ cle, valeur })),
    });
  };

  return (
    <AdminLayout>
      <form onSubmit={soumettre} className="space-y-6 max-w-4xl">
        {demo?.actif && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              <span className="font-semibold">Mode démonstration.</span>{" "}
              Les modifications s'appliquent au site en direct mais vivent en mémoire :
              elles repartent à zéro au redémarrage du serveur.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={TITRE_PAGE}>Contenus du site</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Masquez une section, modifiez ses textes, ajoutez ou supprimez des entrées.
              Tout s'applique immédiatement aux pages publiques.
            </p>
          </div>
          <button type="submit" disabled={enregistrer.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60 self-start whitespace-nowrap">
            <Save className="w-4 h-4" />
            {enregistrer.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        {/* Onglets par page */}
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Pages du site">
          {pages.map(p => (
            <button key={p} type="button" role="tab" aria-selected={ongletPage === p}
              onClick={() => setOngletPage(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                ongletPage === p
                  ? "bg-[#185FA5] text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}>
              {p}
            </button>
          ))}
        </div>

        {/* Visibilité des sections */}
        {sectionsPage.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <header className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
              <LayoutList className="w-4 h-4 text-[#185FA5]" aria-hidden="true" />
              <h2 className={TITRE_CARTE}>
                Sections affichées — {ongletPage}
              </h2>
            </header>
            <div className="p-5 space-y-4">
              {sectionsPage.map(s => {
                const actif = estVrai(valeurs[s.cle]);
                return (
                  <div key={s.cle} className="flex items-center justify-between gap-4">
                    <label htmlFor={`sec-${s.cle}`} className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      {actif
                        ? <Eye className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        : <EyeOff className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                      {s.libelle}
                    </label>
                    <Interrupteur id={`sec-${s.cle}`} libelle={s.libelle} actif={actif}
                      onChange={v => setValeurs(p => ({ ...p, [s.cle]: v ? "oui" : "non" }))} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Titres et chapôs des sections */}
        {textesPage.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
              <h2 className={TITRE_CARTE}>Titres et textes — {ongletPage}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Les intitulés visibles sur la page. Vider un champ rétablit le texte d'origine.
              </p>
            </header>
            <div className="p-5 space-y-4">
              {textesPage.map(t => (
                <div key={t.cle}>
                  <label htmlFor={`txt-${t.cle}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.libelle}
                  </label>
                  {t.type === "texte_long" ? (
                    <textarea id={`txt-${t.cle}`} rows={2} value={valeurs[t.cle] ?? ""}
                      placeholder={t.defaut}
                      onChange={e => setValeurs(p => ({ ...p, [t.cle]: e.target.value }))}
                      className={`${champCss} resize-none`} />
                  ) : (
                    <input id={`txt-${t.cle}`} type="text" value={valeurs[t.cle] ?? ""}
                      placeholder={t.defaut}
                      onChange={e => setValeurs(p => ({ ...p, [t.cle]: e.target.value }))}
                      className={champCss} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Listes éditables */}
        {listesPage.map(def => (
          <section key={def.cle} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
              <h2 className={TITRE_CARTE}>{def.libelle}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{def.description}</p>
            </header>
            <div className="p-5">
              <EditeurListe
                definition={def}
                entrees={lireListe(def.cle, valeurs[def.cle], { pourEdition: true })}
                onChange={v => setValeurs(p => ({ ...p, [def.cle]: JSON.stringify(v) }))}
              />
            </div>
          </section>
        ))}

        {sectionsPage.length === 0 && listesPage.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
            Rien de configurable sur cette page pour le moment.
          </p>
        )}

        <div className="flex items-center gap-3 pb-2">
          <button type="submit" disabled={enregistrer.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {enregistrer.isPending ? "Enregistrement..." : "Enregistrer les contenus"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
