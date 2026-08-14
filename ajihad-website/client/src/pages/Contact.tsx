import { useState } from "react";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Send, CheckCircle, ChevronRight, Facebook, Instagram, Clock } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { emailValide } from "@/lib/validation";

type ErreursContact = Record<string, string>;

export default function Contact() {
  const [form, setForm] = useState({ nomComplet: "", email: "", telephone: "", organisation: "", objet: "", message: "", type: "general" as const, consentement: false });
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [erreurs, setErreurs] = useState<ErreursContact>({});

  const mutation = trpc.forms.submitContact.useMutation({
    onSuccess: (data) => { setSubmitted(true); setReference(data.reference); toast.success(`Message envoyé ! Référence : ${data.reference}`); },
    onError: (err) => toast.error(`Erreur : ${err.message}`),
  });

  const effacerErreur = (champ: string) => {
    setErreurs(prev => {
      if (!prev[champ]) return prev;
      const suivant = { ...prev };
      delete suivant[champ];
      return suivant;
    });
  };

  const validerFormulaire = () => {
    const suivantes: ErreursContact = {};
    if (!form.nomComplet.trim()) suivantes.nomComplet = "Votre nom complet est requis.";
    if (!form.email.trim()) suivantes.email = "Votre adresse e-mail est requise.";
    else if (!emailValide(form.email)) suivantes.email = "Saisissez une adresse e-mail valide.";
    if (!form.objet.trim()) suivantes.objet = "L'objet de votre message est requis.";
    if (!form.message.trim()) suivantes.message = "Votre message est requis.";
    if (!form.consentement) suivantes.consentement = "Votre consentement est requis pour envoyer ce formulaire.";

    setErreurs(suivantes);
    const premierChamp = Object.keys(suivantes)[0];
    if (premierChamp) requestAnimationFrame(() => document.getElementById(premierChamp)?.focus());
    return Object.keys(suivantes).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerFormulaire()) return;
    mutation.mutate(form);
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Contact"
        description="Contactez l'équipe AJIHAD pour toute question, proposition de collaboration ou demande d'information."
      />
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="contact-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Contact</span>
          </nav>
          <h1 id="contact-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
            Contactez <span className="text-[#4DBFBF]">AJIHAD</span>
          </h1>
          <p className="text-xl text-blue-100/90 leading-relaxed max-w-2xl">
            Une question, une proposition de partenariat, une demande d'information ? Notre équipe est à votre écoute.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Infos contact */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Nos coordonnées</h2>
                <div className="space-y-4">
                  {[
                    { icon: Mail, titre: "Email", valeur: "contact@ajihad.org", href: "mailto:contact@ajihad.org" },
                    { icon: MapPin, titre: "Localisation", valeur: "Artibonite, Haïti", href: null },
                    { icon: Clock, titre: "Disponibilité", valeur: "Lun–Ven, 8h–17h (HT)", href: null },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-[#185FA5]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{item.titre}</p>
                        {item.href ? (
                          <a href={item.href} className="font-semibold text-gray-900 dark:text-white hover:text-[#185FA5] transition-colors text-sm">{item.valeur}</a>
                        ) : (
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.valeur}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Réseaux sociaux</h3>
                <div className="flex gap-3">
                  <a href="https://facebook.com/ajihad.haiti" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#185FA5] text-white rounded-lg flex items-center justify-center hover:bg-[#042C53] transition-colors" aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/ajihad.haiti" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-[#B64926] to-[#F4A022] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity" aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="mailto:contact@ajihad.org" className="w-10 h-10 bg-[#4DBFBF] text-white rounded-lg flex items-center justify-center hover:bg-[#3aa0a0] transition-colors" aria-label="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="bg-[#042C53] rounded-xl p-5 text-white">
                <h3 className="font-bold mb-2">Presse & Médias</h3>
                <p className="text-blue-200/80 text-sm leading-relaxed mb-3">Pour toute demande d'interview, de partenariat médiatique ou d'information institutionnelle, utilisez le formulaire en sélectionnant "Médias".</p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-10 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Message reçu !</h3>
                  <p className="text-green-700 dark:text-green-400 mb-4">Votre message a été transmis à notre équipe.</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <span className="text-green-800 dark:text-green-300 font-mono font-bold text-sm">Référence : {reference}</span>
                  </div>
                  <p className="text-green-600 dark:text-green-500 text-sm mt-4">Nous vous répondrons dans les 48 heures ouvrables.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nomComplet" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nom complet *</label>
                      <input id="nomComplet" type="text" required value={form.nomComplet} onChange={e => { setForm(p => ({ ...p, nomComplet: e.target.value })); effacerErreur("nomComplet"); }}
                        aria-invalid={Boolean(erreurs.nomComplet)} aria-describedby={erreurs.nomComplet ? "nomComplet-error" : undefined}
                        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${erreurs.nomComplet ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                        placeholder="Votre nom complet" />
                      {erreurs.nomComplet && <p id="nomComplet-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{erreurs.nomComplet}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Adresse e-mail *</label>
                      <input id="email" type="email" required value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); effacerErreur("email"); }}
                        aria-invalid={Boolean(erreurs.email)} aria-describedby={erreurs.email ? "email-error" : undefined}
                        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${erreurs.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                        placeholder="votre@email.com" />
                      {erreurs.email && <p id="email-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{erreurs.email}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                      <input id="telephone" type="tel" value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none transition-all"
                        placeholder="+509 XXXX-XXXX" />
                    </div>
                    <div>
                      <label htmlFor="organisation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Organisation</label>
                      <input id="organisation" type="text" value={form.organisation} onChange={e => setForm(p => ({ ...p, organisation: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none transition-all"
                        placeholder="Votre organisation (optionnel)" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type de demande *</label>
                    <select id="type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                      <option value="general">Renseignement général</option>
                      <option value="partenariat">Proposition de partenariat</option>
                      <option value="media">Demande médias / presse</option>
                      <option value="contribution">Contribution / Don</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="objet" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Objet *</label>
                    <input id="objet" type="text" required value={form.objet} onChange={e => { setForm(p => ({ ...p, objet: e.target.value })); effacerErreur("objet"); }}
                      aria-invalid={Boolean(erreurs.objet)} aria-describedby={erreurs.objet ? "objet-error" : undefined}
                      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${erreurs.objet ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                      placeholder="Objet de votre message" />
                    {erreurs.objet && <p id="objet-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{erreurs.objet}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                    <textarea id="message" required rows={6} value={form.message} onChange={e => { setForm(p => ({ ...p, message: e.target.value })); effacerErreur("message"); }}
                      aria-invalid={Boolean(erreurs.message)} aria-describedby={erreurs.message ? "message-error" : undefined}
                      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all resize-none ${erreurs.message ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                      placeholder="Décrivez votre demande en détail..." />
                    {erreurs.message && <p id="message-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{erreurs.message}</p>}
                  </div>
                  <div className="flex items-start gap-3">
                    <input id="consentement" type="checkbox" checked={form.consentement} onChange={e => { setForm(p => ({ ...p, consentement: e.target.checked })); effacerErreur("consentement"); }}
                      aria-invalid={Boolean(erreurs.consentement)} aria-describedby={erreurs.consentement ? "consentement-error" : undefined}
                      className="mt-1 w-4 h-4 text-[#185FA5] rounded border-gray-300 focus:ring-[#185FA5]" />
                    <label htmlFor="consentement" className="text-sm text-gray-600 dark:text-gray-400">
                      J'accepte que mes données soient traitées par AJIHAD conformément à la <Link href="/confidentialite" className="text-[#185FA5] underline">politique de confidentialité</Link>.
                    </label>
                  </div>
                  {erreurs.consentement && <p id="consentement-error" role="alert" className="-mt-4 text-sm text-red-600 dark:text-red-400">{erreurs.consentement}</p>}
                  <button type="submit" disabled={mutation.isPending}
                    className="w-full btn-primary-ajihad justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                    {mutation.isPending ? "Envoi en cours..." : "Envoyer le message"}
                    {!mutation.isPending && <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
