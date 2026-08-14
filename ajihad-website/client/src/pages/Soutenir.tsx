import { useState } from "react";
import { Link } from "wouter";
import { Heart, Shield, Award, Users, CheckCircle, ChevronRight, ArrowRight, Handshake, Globe } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { emailValide } from "@/lib/validation";

const montants = ["10", "25", "50", "100", "250", "500"];
const projets = ["PROJEFA 2026", "Reboisement Gonaïves", "Bibliothèque de l'Amitié", "AJI CONNECT"];

export default function Soutenir() {
  const [montantSelectionne, setMontantSelectionne] = useState("50");
  const [montantCustom, setMontantCustom] = useState("");
  const [form, setForm] = useState({ nomContributeur: "", email: "", pays: "Haiti", typeContribution: "financiere" as const, projetSoutenu: "", montant: "", devise: "USD", moyenContribution: "", commentaire: "", souhaitRecu: false, consentement: false });
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const mutation = trpc.forms.submitContribution.useMutation({
    onSuccess: (data) => { setSubmitted(true); setReference(data.reference); toast.success(`Déclaration enregistrée ! Référence : ${data.reference}`); },
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
    const suivantes: Record<string, string> = {};
    const montantFinal = montantCustom || montantSelectionne;
    if (!montantFinal || Number(montantFinal) <= 0) suivantes.montant = "Choisissez ou saisissez un montant supérieur à 0.";
    if (!form.email.trim()) suivantes.email = "Votre adresse e-mail est requise.";
    else if (!emailValide(form.email)) suivantes.email = "Saisissez une adresse e-mail valide.";
    if (!form.consentement) suivantes.consentement = "Votre consentement est requis pour enregistrer cette contribution.";
    setErreurs(suivantes);
    const premierChamp = Object.keys(suivantes)[0];
    if (premierChamp) requestAnimationFrame(() => document.getElementById(premierChamp === "montant" ? "montant-custom" : premierChamp === "consentement" ? "consent-soutenir" : "email-contrib")?.focus());
    return Object.keys(suivantes).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerFormulaire()) return;
    const montantFinal = montantCustom || montantSelectionne;
    mutation.mutate({ ...form, montant: montantFinal });
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Soutenir AJIHAD"
        description="Contribuez au développement de la jeunesse haïtienne : dons, contributions en nature et partenariats."
      />
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#B64926] text-white" aria-labelledby="soutenir-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-orange-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Soutenir AJIHAD</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Heart className="w-3.5 h-3.5 text-[#F4A022]" />
              Chaque contribution compte
            </div>
            <h1 id="soutenir-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
              Soutenez la <span className="text-[#F4A022]">jeunesse haïtienne</span>
            </h1>
            <p className="text-xl text-orange-100/90 leading-relaxed">
              Votre soutien permet à AJIHAD de former des leaders, de protéger l'environnement et de créer des opportunités concrètes pour les jeunes haïtiens.
            </p>
          </div>
        </div>
      </section>

      {/* Pourquoi soutenir */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Award, titre: "Impact suivi", desc: "Indicateurs et objectifs publiés au fil des projets.", color: "#185FA5" },
              { icon: Shield, titre: "Gestion documentée", desc: "Les ressources disponibles sont regroupées et signalées clairement.", color: "#4DBFBF" },
              { icon: Users, titre: "Jeunesse au cœur", desc: "Chaque projet présenté vise le développement des jeunes.", color: "#B64926" },
              { icon: Handshake, titre: "Partenariat responsable", desc: "Des collaborations définies autour d'objectifs partagés.", color: "#F4A022" },
            ].map((item, i) => (
              <div key={i} className="text-center p-5 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.titre}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire contribution */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Déclarer une contribution</h2>
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">Contribution enregistrée !</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg mt-1">
                    <span className="text-green-800 dark:text-green-300 font-mono font-bold text-sm">Référence : {reference}</span>
                  </div>
                  <p className="text-green-600 dark:text-green-500 text-sm mt-3">Notre équipe vous contactera pour finaliser votre contribution.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Montants rapides */}
                  <div>
                    <span id="montant-label" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Montant (USD)</span>
                    <div className="grid grid-cols-3 gap-2 mb-3" role="group" aria-labelledby="montant-label">
                      {montants.map(m => (
                        <button key={m} type="button" onClick={() => { setMontantSelectionne(m); setMontantCustom(""); effacerErreur("montant"); }}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${montantSelectionne === m && !montantCustom ? "bg-[#B64926] text-white" : "bg-[#F6F8FB] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                          ${m}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="montant-custom" className="sr-only">Autre montant en dollars américains</label>
                    <input id="montant-custom" type="number" min="1" value={montantCustom} onChange={e => { setMontantCustom(e.target.value); setMontantSelectionne(""); effacerErreur("montant"); }}
                      aria-invalid={Boolean(erreurs.montant)} aria-describedby={erreurs.montant ? "montant-error" : undefined}
                      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 outline-none ${erreurs.montant ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#B64926]"}`}
                      placeholder="Autre montant (USD)" />
                    {erreurs.montant && <p id="montant-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{erreurs.montant}</p>}
                  </div>
                  <div>
                    <label htmlFor="projet-soutenu" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Projet à soutenir</label>
                    <select id="projet-soutenu" value={form.projetSoutenu} onChange={e => setForm(p => ({ ...p, projetSoutenu: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B64926] outline-none">
                      <option value="">Fonds général AJIHAD</option>
                      {projets.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom-contrib" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nom (optionnel)</label>
                      <input id="nom-contrib" type="text" value={form.nomContributeur} onChange={e => setForm(p => ({ ...p, nomContributeur: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B64926] outline-none" placeholder="Votre nom" />
                    </div>
                    <div>
                      <label htmlFor="email-contrib" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                      <input id="email-contrib" type="email" required value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); effacerErreur("email"); }}
                        aria-invalid={Boolean(erreurs.email)} aria-describedby={erreurs.email ? "email-contrib-error" : undefined}
                        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 outline-none ${erreurs.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#B64926]"}`} placeholder="votre@email.com" />
                      {erreurs.email && <p id="email-contrib-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{erreurs.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="moyen" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Moyen de contribution</label>
                    <select id="moyen" value={form.moyenContribution} onChange={e => setForm(p => ({ ...p, moyenContribution: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B64926] outline-none">
                      <option value="">Sélectionner</option>
                      <option value="virement">Virement bancaire</option>
                      <option value="moncash">MonCash</option>
                      <option value="paypal">PayPal</option>
                      <option value="western_union">Western Union</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="flex items-start gap-3">
                    <input id="consent-soutenir" type="checkbox" checked={form.consentement} onChange={e => { setForm(p => ({ ...p, consentement: e.target.checked })); effacerErreur("consentement"); }}
                      aria-invalid={Boolean(erreurs.consentement)} aria-describedby={erreurs.consentement ? "consent-soutenir-error" : undefined}
                      className="mt-1 w-4 h-4 text-[#B64926] rounded border-gray-300" />
                    <label htmlFor="consent-soutenir" className="text-sm text-gray-600 dark:text-gray-400">
                      J'accepte les conditions d'utilisation et la <Link href="/confidentialite" className="text-[#B64926] underline">politique de confidentialité</Link>.
                    </label>
                  </div>
                  {erreurs.consentement && <p id="consent-soutenir-error" role="alert" className="-mt-3 text-sm text-red-600 dark:text-red-400">{erreurs.consentement}</p>}
                  <button type="submit" disabled={mutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#B64926] hover:bg-[#94391C] text-white font-bold rounded-xl transition-all disabled:opacity-60">
                    {mutation.isPending ? "Envoi en cours..." : "Déclarer ma contribution"}
                    {!mutation.isPending && <Heart className="w-4 h-4" />}
                  </button>
                  <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                    Aucune donnée bancaire n'est collectée ici. Notre équipe vous contactera pour les détails du transfert.
                  </p>
                </form>
              )}
            </div>

            {/* Autres façons de soutenir */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Autres façons de soutenir</h2>
              {[
                { icon: Users, titre: "Devenir membre", desc: "Rejoignez AJIHAD et participez activement à notre mission.", href: "/s-impliquer#membre", color: "#185FA5" },
                { icon: Heart, titre: "Bénévolat", desc: "Offrez votre temps et vos compétences sur le terrain.", href: "/s-impliquer#benevole", color: "#B64926" },
                { icon: Handshake, titre: "Partenariat institutionnel", desc: "Établissez un partenariat stratégique avec AJIHAD.", href: "/s-impliquer#partenariat", color: "#4DBFBF" },
                { icon: Globe, titre: "Ambassadeur", desc: "Représentez AJIHAD dans votre région ou à l'international.", href: "/s-impliquer#ambassadeur", color: "#F4A022" },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-4 p-5 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.titre}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#185FA5] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
