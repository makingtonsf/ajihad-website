import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import {
  Settings, Save, Plus, Trash2, GripVertical, Eye, EyeOff, TriangleAlert,
  RotateCcw, Megaphone, Link2, GraduationCap, CreditCard,
} from "lucide-react";
import {
  PARAMETRES_SITE, configParDefaut, estVrai, lireModules,
  MODULES_PROJEFA_DEFAUT, type ModuleProjefa, type DefinitionParametre,
} from "@shared/configSite";
import { TITRE_CARTE, TITRE_PAGE } from "@/lib/typographie";

const ICONE_GROUPE: Record<string, typeof Megaphone> = {
  "Annonce temporaire": Megaphone,
  "Visibilité des liens": Link2,
  "Carte de membre": CreditCard,
  PROJEFA: GraduationCap,
};

const champ =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";

/** Interrupteur accessible, plus lisible qu'une case à cocher pour un drapeau. */
function Interrupteur({
  actif, onChange, id, libelle,
}: { actif: boolean; onChange: (v: boolean) => void; id: string; libelle: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={actif}
      aria-label={libelle}
      onClick={() => onChange(!actif)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        actif ? "bg-[#185FA5]" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
          actif ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Éditeur de la liste des modules PROJEFA. */
function EditeurModules({
  modules, onChange,
}: { modules: ModuleProjefa[]; onChange: (m: ModuleProjefa[]) => void }) {
  const maj = (i: number, cle: keyof ModuleProjefa, v: string) =>
    onChange(modules.map((m, j) => (j === i ? { ...m, [cle]: v } : m)));

  const deplacer = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= modules.length) return;
    const copie = [...modules];
    [copie[i], copie[j]] = [copie[j], copie[i]];
    onChange(copie);
  };

  return (
    <div className="space-y-3">
      {modules.map((m, i) => (
        <div key={i} className="bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
                className="text-gray-400 hover:text-[#185FA5] disabled:opacity-30 disabled:hover:text-gray-400 text-xs leading-none"
                aria-label={`Monter le module ${i + 1}`}>▲</button>
              <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500" aria-hidden="true" />
              <button type="button" onClick={() => deplacer(i, 1)} disabled={i === modules.length - 1}
                className="text-gray-400 hover:text-[#185FA5] disabled:opacity-30 disabled:hover:text-gray-400 text-xs leading-none"
                aria-label={`Descendre le module ${i + 1}`}>▼</button>
            </div>
            <span className="text-2xl font-extrabold text-gray-200 dark:text-gray-600 leading-none pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 space-y-2 min-w-0">
              <input
                value={m.titre}
                onChange={e => maj(i, "titre", e.target.value)}
                placeholder="Titre du module"
                aria-label={`Titre du module ${i + 1}`}
                className={`${champ} font-semibold`}
              />
              <textarea
                rows={2}
                value={m.description}
                onChange={e => maj(i, "description", e.target.value)}
                placeholder="Ce que le participant en retire, en une phrase."
                aria-label={`Description du module ${i + 1}`}
                className={`${champ} resize-none`}
              />
            </div>
            <button type="button" onClick={() => onChange(modules.filter((_, j) => j !== i))}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
              aria-label={`Supprimer le module ${i + 1}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange([...modules, { titre: "", description: "" }])}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#185FA5] border border-dashed border-[#185FA5] rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un module
        </button>
        <button type="button" onClick={() => onChange(MODULES_PROJEFA_DEFAUT)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <RotateCcw className="w-4 h-4" /> Rétablir les modules 2026
        </button>
      </div>
    </div>
  );
}

export default function AdminParametres() {
  const { data: enregistres, refetch } = trpc.admin.parametres.list.useQuery();
  const { data: demo } = trpc.admin.modeDemo.useQuery();
  const utils = trpc.useUtils();

  const [valeurs, setValeurs] = useState<Record<string, string>>(configParDefaut);
  const [initialise, setInitialise] = useState(false);

  // On ne réécrase l'état local qu'au premier chargement : sinon un refetch
  // effacerait les modifications en cours de saisie.
  useEffect(() => {
    if (!enregistres || initialise) return;
    const base = configParDefaut();
    for (const p of enregistres) {
      if (p.cle && p.valeur !== null) base[p.cle] = p.valeur;
    }
    setValeurs(base);
    setInitialise(true);
  }, [enregistres, initialise]);

  const enregistrer = trpc.admin.parametres.updateMany.useMutation({
    onSuccess: async () => {
      toast.success("Configuration enregistrée. Le site public est à jour.");
      await utils.public.configSite.invalidate();
      refetch();
    },
    onError: (e: any) => toast.error(`Erreur : ${e.message}`),
  });

  const modules = useMemo(() => lireModules(valeurs.projefa_modules), [valeurs.projefa_modules]);

  const poser = (cle: string, v: string) => setValeurs(p => ({ ...p, [cle]: v }));

  const groupes = useMemo(() => {
    const map = new Map<string, DefinitionParametre[]>();
    for (const p of PARAMETRES_SITE) {
      if (!map.has(p.groupe)) map.set(p.groupe, []);
      map.get(p.groupe)!.push(p);
    }
    return Array.from(map.entries());
  }, []);

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    enregistrer.mutate({
      valeurs: PARAMETRES_SITE.map(p => ({ cle: p.cle, valeur: valeurs[p.cle] ?? p.defaut })),
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
              Les réglages fonctionnent et s'appliquent au site en direct, mais vivent en mémoire :
              ils repartent à zéro au redémarrage du serveur.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={TITRE_PAGE}>Configuration du site</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Annonce temporaire, visibilité des liens et paramètres PROJEFA. Chaque changement s'applique immédiatement aux pages publiques.
            </p>
          </div>
          <button type="submit" disabled={enregistrer.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60 self-start whitespace-nowrap">
            <Save className="w-4 h-4" />
            {enregistrer.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        {groupes.map(([groupe, champs]) => {
          const Icone = ICONE_GROUPE[groupe] ?? Settings;
          return (
            <section key={groupe} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <header className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                <Icone className="w-4 h-4 text-[#185FA5]" aria-hidden="true" />
                <h2 className={TITRE_CARTE}>{groupe}</h2>
              </header>

              <div className="p-5 space-y-5">
                {champs.map((def: DefinitionParametre) => {
                  const id = `param-${def.cle}`;
                  const valeur = valeurs[def.cle] ?? def.defaut;

                  if (def.type === "booleen") {
                    const actif = estVrai(valeur);
                    return (
                      <div key={def.cle} className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            {actif
                              ? <Eye className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                              : <EyeOff className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                            {def.libelle}
                          </label>
                          {def.aide && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{def.aide}</p>}
                        </div>
                        <Interrupteur id={id} libelle={def.libelle} actif={actif}
                          onChange={v => poser(def.cle, v ? "oui" : "non")} />
                      </div>
                    );
                  }

                  if (def.type === "modules") {
                    return (
                      <div key={def.cle}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{def.libelle}</p>
                        {def.aide && <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{def.aide}</p>}
                        <EditeurModules
                          modules={modules}
                          onChange={m => poser(def.cle, JSON.stringify(m))}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={def.cle}>
                      <label htmlFor={id} className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {def.libelle}
                      </label>
                      {def.aide && <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{def.aide}</p>}
                      {def.type === "texte_long" ? (
                        <textarea id={id} rows={3} value={valeur}
                          onChange={e => poser(def.cle, e.target.value)} className={`${champ} resize-none`} />
                      ) : (
                        <input id={id} type={def.type === "date" ? "date" : "text"} value={valeur}
                          onChange={e => poser(def.cle, e.target.value)} className={champ} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="flex items-center gap-3 pb-2">
          <button type="submit" disabled={enregistrer.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {enregistrer.isPending ? "Enregistrement..." : "Enregistrer la configuration"}
          </button>
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {PARAMETRES_SITE.length} réglages
          </span>
        </div>
      </form>
    </AdminLayout>
  );
}
