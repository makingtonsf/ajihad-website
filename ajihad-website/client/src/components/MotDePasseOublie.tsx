import { useState } from "react";
import { CircleHelp, Send, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Demande d'aide « mot de passe oublié », posée sous les deux écrans de
 * connexion.
 *
 * Il n'y a volontairement pas d'envoi automatique de lien : les mots de passe
 * sont hachés, personne ne peut les relire, et l'association n'a pas de service
 * d'e-mail sortant. La demande arrive donc en alerte dans l'administration
 * (/admin/acces), où un responsable réinitialise puis transmet les nouveaux
 * identifiants de vive voix.
 *
 * `variante="sombre"` adapte les couleurs à l'écran d'administration, dont le
 * panneau est foncé en permanence.
 */
export default function MotDePasseOublie({
  espace,
  variante = "clair",
  emailPreRempli = "",
}: {
  espace: "administration" | "membre";
  variante?: "clair" | "sombre";
  /** Reprend l'adresse déjà saisie plus haut : on ne la retape pas. */
  emailPreRempli?: string;
}) {
  const sombre = variante === "sombre";
  const [ouvert, setOuvert] = useState(false);
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);

  // L'adresse du formulaire de connexion sert de point de départ, sans figer
  // la saisie : on peut demander de l'aide pour une autre adresse.
  const valeur = email || emailPreRempli;

  const demander = trpc.auth.motDePasseOublie.useMutation({
    onSuccess: d => {
      setEnvoye(true);
      toast.success(d.message);
    },
    onError: e => toast.error(e.message),
  });

  const lienCss = sombre
    ? "text-blue-200/80 hover:text-white"
    : "text-gray-500 dark:text-gray-400 hover:text-[#185FA5] dark:hover:text-blue-400";

  const champCss = sombre
    ? "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200/50 text-sm outline-none focus:ring-2 focus:ring-[#4DBFBF]"
    : "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#185FA5]";

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={`inline-flex items-center gap-1.5 text-xs transition-colors ${lienCss}`}
      >
        <CircleHelp className="w-3.5 h-3.5" aria-hidden="true" />
        Mot de passe oublié ?
      </button>
    );
  }

  if (envoye) {
    return (
      <p className={`text-xs leading-relaxed ${sombre ? "text-blue-200/80" : "text-gray-500 dark:text-gray-400"}`}>
        Demande enregistrée. Un responsable AJIHAD vous recontactera pour vous
        transmettre de nouveaux identifiants.
      </p>
    );
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        demander.mutate({ email: valeur.trim(), espace });
      }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={`oubli-${espace}`}
          className={`text-xs font-medium ${sombre ? "text-blue-100" : "text-gray-700 dark:text-gray-300"}`}
        >
          Votre adresse e-mail
        </label>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className={`p-1 rounded ${lienCss}`}
          aria-label="Annuler la demande"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          id={`oubli-${espace}`}
          type="email"
          required
          value={valeur}
          onChange={e => setEmail(e.target.value)}
          placeholder="vous@exemple.org"
          className={champCss}
        />
        <button
          type="submit"
          disabled={demander.isPending}
          className="px-3 py-2 rounded-lg bg-[#185FA5] text-white text-sm font-semibold hover:bg-[#042C53] disabled:opacity-60 transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          {demander.isPending ? "Envoi…" : "Envoyer"}
        </button>
      </div>

      <p className={`text-xs ${sombre ? "text-blue-200/60" : "text-gray-400 dark:text-gray-500"}`}>
        Aucun mot de passe n'est envoyé par e-mail : un responsable vous les
        remettra directement.
      </p>
    </form>
  );
}
