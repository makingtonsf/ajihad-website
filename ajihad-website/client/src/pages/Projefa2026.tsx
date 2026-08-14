import { Link } from "wouter";
import {
  BookOpen, Users, Target, Calendar, ArrowRight, CheckCircle, Clock,
  MapPin, Star, Award, ChevronRight, Heart, Lightbulb, Globe, Wifi, Music
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { useState, useCallback } from "react";
import { X, ChevronLeft, ZoomIn, Images } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useConfigSite } from "@/hooks/useConfigSite";
import { Lock } from "lucide-react";
import { emailValide } from "@/lib/validation";

// Habillage visuel des modules. Les titres et descriptions viennent de
// l'administration (/admin/parametres) ; ce tableau ne fournit que l'icône et
// la couleur, appliquées par position et rebouclées si l'édition en compte plus.
const HABILLAGE_MODULES = [
  { icon: Globe, color: "#185FA5" },
  { icon: Wifi, color: "#4DBFBF" },
  { icon: Star, color: "#B64926" },
  { icon: Music, color: "#F4A022" },
  { icon: Lightbulb, color: "#185FA5" },
  { icon: Award, color: "#4DBFBF" },
];



const HABILLAGE_CHIFFRES = [Users, Calendar, Heart, BookOpen];

export default function Projefa2026() {
  const { modules, inscriptionsProjefaOuvertes, texte, txt, liste } = useConfigSite();
  const [formData, setFormData] = useState({ prenom: "", nom: "", email: "", telephone: "", departement: "", motivation: "", consentement: false });
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const galleryPhotos = [
    { id: 1, src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=900&q=80", thumb: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=70", caption: "Session de formation — Module Leadership", session: "Module 1", span: "col-span-2 row-span-2" },
    { id: 2, src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80", thumb: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=70", caption: "Atelier de travail en groupe", session: "Module 2", span: "" },
    { id: 3, src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80", thumb: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=70", caption: "Présentation des projets citoyens", session: "Module 3", span: "" },
    { id: 4, src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80", thumb: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70", caption: "Formation numérique et technologie", session: "Module 4", span: "" },
    { id: 5, src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80", thumb: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=70", caption: "Activité communautaire sur le terrain", session: "Module 5", span: "col-span-2" },
    { id: 6, src: "/images/remise-attestations.jpeg", thumb: "/images/remise-attestations.jpeg", caption: "Cérémonie de remise des attestations aux bénéficiaires AJIHAD", session: "Clôture", span: "col-span-2" },
    { id: 7, src: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=900&q=80", thumb: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&q=70", caption: "Réseautage entre participants", session: "Networking", span: "" },
    { id: 8, src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80", thumb: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=70", caption: "Séance d'éducation environnementale", session: "Module 6", span: "" },
  ];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = useCallback((index: number) => { setLightboxIndex(index); setLightboxOpen(true); }, []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevPhoto = useCallback(() => setLightboxIndex(i => (i - 1 + galleryPhotos.length) % galleryPhotos.length), [galleryPhotos.length]);
  const nextPhoto = useCallback(() => setLightboxIndex(i => (i + 1) % galleryPhotos.length), [galleryPhotos.length]);


  const submitMutation = trpc.forms.submitCandidature.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setReference(data.reference);
      toast.success(`Candidature reçue ! Référence : ${data.reference}`);
    },
    onError: (err) => {
      toast.error(`Erreur : ${err.message}`);
    },
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
    if (!formData.prenom.trim()) suivantes.prenom = "Le prénom est requis.";
    if (!formData.nom.trim()) suivantes.nom = "Le nom est requis.";
    if (!formData.email.trim()) suivantes.email = "L'adresse e-mail est requise.";
    else if (!emailValide(formData.email)) suivantes.email = "Saisissez une adresse e-mail valide.";
    if (!formData.motivation.trim()) suivantes.motivation = "La lettre de motivation est requise.";
    if (!formData.consentement) suivantes.consentement = "Votre consentement est requis pour envoyer la candidature.";
    setErreurs(suivantes);
    const premierChamp = Object.keys(suivantes)[0];
    if (premierChamp) requestAnimationFrame(() => document.getElementById(premierChamp === "consentement" ? "consentement-projefa" : premierChamp)?.focus());
    return Object.keys(suivantes).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerFormulaire()) return;
    submitMutation.mutate({ ...formData, type: "projefa", motivation: formData.motivation || "Candidature PROJEFA 2026" });
  };

  return (
    <PublicLayout>
      <SEOHead
        title="PROJEFA 2026"
        description="Programme Estival de Formation et de Leadership Jeunesse : 8 semaines de formation gratuite pour 250 jeunes haïtiens."
      />
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-[#042C53] via-[#185FA5] to-[#1a7a7a] text-white overflow-hidden" aria-labelledby="projefa-hero-heading">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/fond-accueil.png')", backgroundSize: "cover" }} aria-hidden="true" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#4DBFBF]/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/nos-actions" className="hover:text-white transition-colors">Nos actions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">PROJEFA 2026</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4DBFBF]/20 rounded-full text-[#4DBFBF] text-sm font-semibold mb-6 border border-[#4DBFBF]/30">
            <BookOpen className="w-3.5 h-3.5" />
            Programme Phare AJIHAD 2026
          </div>
          <h1 id="projefa-hero-heading" className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            PROJEFA <span className="text-[#4DBFBF]">2026</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100/90 font-medium mb-4">
            Programme Estival de Formation et de Leadership Jeunesse
          </p>
          <p className="text-lg text-blue-100/80 leading-relaxed max-w-2xl mb-10">
            8 semaines de formation gratuite et intensive pour 250 jeunes de 15 à 30 ans. Numérique, leadership, entrepreneuriat, arts — tout pour préparer la jeunesse haïtienne à agir.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#candidature" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#4DBFBF] text-white font-bold rounded-xl hover:bg-[#3aa0a0] transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
              {inscriptionsProjefaOuvertes ? txt("txt_projefa_candidature_titre") : "Recevoir les prochaines informations"}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#programme" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              Voir le programme
            </a>
          </div>
        </div>
      </section>

      {/* Indicateurs clés */}
      <section className="py-12 bg-white dark:bg-gray-900" aria-label="Chiffres clés du programme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {liste("projefa_indicateurs").map((ind, i) => {
              const Icone = HABILLAGE_CHIFFRES[i % HABILLAGE_CHIFFRES.length];
              return (
              <div key={i} className="text-center p-6 bg-[#F6F8FB] dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Icone className="w-8 h-8 text-[#185FA5] mx-auto mb-3" />
                <div className="text-3xl font-extrabold text-[#185FA5] dark:text-blue-400 mb-1">{ind.valeur}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{ind.label}</div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Objectifs */}
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="objectifs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 id="objectifs-heading" className="section-heading mb-6">{txt("txt_projefa_objectifs_titre")}</h2>
              <div className="space-y-4">
                {liste("projefa_objectifs").map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4DBFBF] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{obj.texte}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">Bénéficiaires ciblés</h3>
              <div className="space-y-4">
                {[
                  { icon: Users, titre: "Jeunes de 15 à 30 ans", desc: "Résidant dans les zones d'intervention d'AJIHAD" },
                  { icon: MapPin, titre: "Artibonite & Ouest", desc: "Priorité aux communes de Gonaïves, Saint-Marc et environs" },
                  { icon: Heart, titre: "Inclusivité garantie", desc: "40% de places réservées aux jeunes femmes" },
                  { icon: Target, titre: "Gratuit & accessible", desc: "Aucun frais d'inscription — programme entièrement gratuit" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-[#185FA5]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.titre}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* {txt("txt_projefa_modules_titre")} */}
      <section id="programme" className="py-20 bg-white dark:bg-gray-900" aria-labelledby="modules-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="modules-heading" className="section-heading">Modules de formation</h2>
            <p className="section-subheading mx-auto mt-4">
              {modules.length} module{modules.length > 1 ? "s" : ""} thématique{modules.length > 1 ? "s" : ""}, pensés pour être complémentaires.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => {
              const style = HABILLAGE_MODULES[i % HABILLAGE_MODULES.length];
              return (
                <div key={mod.titre} className="bg-[#F6F8FB] dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-extrabold text-gray-200 dark:text-gray-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${style.color}15` }}>
                      <style.icon className="w-5 h-5" style={{ color: style.color }} />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{mod.titre}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{mod.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calendrier */}
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="calendrier-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="calendrier-heading" className="section-heading">{txt("txt_projefa_calendrier_titre")}</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
              <div className="space-y-8">
                {liste("projefa_calendrier").map((item, i) => (
                  <div key={i} className="relative flex gap-6">
                    <div className="w-16 h-16 bg-[#185FA5] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 shadow-lg">
                      {item.phase?.split(" ").pop() || i + 1}
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.titre}</h3>
                        <span className="tag-pill tag-blue text-xs">{item.periode}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Galerie Photo */}
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="galerie-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#185FA5] uppercase tracking-widest mb-3">
              <Images className="w-4 h-4" /> Galerie
            </span>
            <h2 id="galerie-heading" className="section-heading">{txt("txt_projefa_galerie_titre")}</h2>
            <p className="section-subheading mx-auto mt-4">{txt("txt_projefa_galerie_chapo")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
            {galleryPhotos.map((photo, index) => (
              <button key={photo.id} onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:ring-offset-2 transition-transform hover:scale-[1.02] ${photo.span}`}
                aria-label={`Voir : ${photo.caption}`}>
                <img src={photo.thumb} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-white text-xs font-medium leading-tight line-clamp-2">{photo.caption}</span>
                  <span className="text-white/70 text-xs mt-0.5">{photo.session}</span>
                </div>
                <div className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">{galleryPhotos.length} photos · Cliquez sur une image pour l'agrandir</p>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Visionneuse de photos">
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Fermer">
            <X className="w-5 h-5 text-white" />
          </button>
          <button onClick={e => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Photo précédente">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
            <img src={galleryPhotos[lightboxIndex].src} alt={galleryPhotos[lightboxIndex].caption} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg p-4 text-white">
              <p className="font-semibold text-sm">{galleryPhotos[lightboxIndex].caption}</p>
              <p className="text-white/70 text-xs mt-0.5">{galleryPhotos[lightboxIndex].session} · {lightboxIndex + 1} / {galleryPhotos.length}</p>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Photo suivante">
            <ChevronLeft className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto pb-1">
            {galleryPhotos.map((photo, index) => (
              <button key={photo.id} onClick={e => { e.stopPropagation(); setLightboxIndex(index); }}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${index === lightboxIndex ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                aria-label={`Photo ${index + 1}`}>
                <img src={photo.thumb} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de candidature */}
      <section id="candidature" className="py-20 bg-white dark:bg-gray-900" aria-labelledby="candidature-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="candidature-heading" className="section-heading">Soumettre ma candidature</h2>
            <p className="section-subheading mx-auto mt-4">
              Remplissez ce formulaire pour exprimer votre intérêt pour PROJEFA 2026. Un accusé de réception avec votre numéro de référence vous sera communiqué.
            </p>
          </div>

          {!inscriptionsProjefaOuvertes ? (
            /* Hors période : le formulaire disparaît entièrement. La fenêtre
               est calculée côté serveur, l'horloge du visiteur n'y change rien. */
            <div className="bg-[#F6F8FB] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Lock className="w-7 h-7 text-[#185FA5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Édition 2026 : inscriptions closes</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
                {texte("projefa_message_ferme")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
                <Link href="/contact" className="btn-primary-ajihad py-2.5 px-5 text-sm">
                  Être prévenu de la prochaine édition
                </Link>
                <Link href="/s-impliquer" className="btn-outline-ajihad py-2.5 px-5 text-sm">
                  Autres façons de s'impliquer
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Candidature reçue !</h3>
              <p className="text-green-700 dark:text-green-400 mb-4">Votre candidature a été enregistrée avec succès.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <span className="text-green-800 dark:text-green-300 font-mono font-bold text-sm">Référence : {reference}</span>
              </div>
              <p className="text-green-600 dark:text-green-500 text-sm mt-4">Conservez cette référence pour le suivi de votre dossier. Notre équipe vous contactera prochainement.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#F6F8FB] dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 space-y-6" noValidate>
              {Object.keys(erreurs).length > 0 && (
                <div id="projefa-errors" role="alert" className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-1">Vérifiez les informations suivantes :</p>
                  <ul className="list-disc pl-5 space-y-1">{Object.values(erreurs).map(message => <li key={message}>{message}</li>)}</ul>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="projefa-prenom" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prénom *</label>
                  <input id="projefa-prenom" type="text" required value={formData.prenom} onChange={e => { setFormData(p => ({ ...p, prenom: e.target.value })); effacerErreur("prenom"); }}
                    aria-invalid={Boolean(erreurs.prenom)} aria-describedby={erreurs.prenom ? "projefa-errors" : undefined}
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${erreurs.prenom ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                    placeholder="Votre prénom" />
                </div>
                <div>
                  <label htmlFor="projefa-nom" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nom de famille *</label>
                  <input id="projefa-nom" type="text" required value={formData.nom} onChange={e => { setFormData(p => ({ ...p, nom: e.target.value })); effacerErreur("nom"); }}
                    aria-invalid={Boolean(erreurs.nom)} aria-describedby={erreurs.nom ? "projefa-errors" : undefined}
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${erreurs.nom ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                    placeholder="Votre nom" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="projefa-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Adresse e-mail *</label>
                  <input id="projefa-email" type="email" required value={formData.email} onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); effacerErreur("email"); }}
                    aria-invalid={Boolean(erreurs.email)} aria-describedby={erreurs.email ? "projefa-errors" : undefined}
                    className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${erreurs.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                    placeholder="votre@email.com" />
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                  <input id="telephone" type="tel" value={formData.telephone} onChange={e => setFormData(p => ({ ...p, telephone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] focus:border-transparent outline-none transition-all"
                    placeholder="+509 XXXX-XXXX" />
                </div>
              </div>
              <div>
                <label htmlFor="departement" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Département / Commune</label>
                <input id="departement" type="text" value={formData.departement} onChange={e => setFormData(p => ({ ...p, departement: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Artibonite, Gonaïves" />
              </div>
              <div>
                <label htmlFor="projefa-motivation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lettre de motivation *</label>
                <textarea id="projefa-motivation" required rows={5} value={formData.motivation} onChange={e => { setFormData(p => ({ ...p, motivation: e.target.value })); effacerErreur("motivation"); }}
                  aria-invalid={Boolean(erreurs.motivation)} aria-describedby={erreurs.motivation ? "projefa-errors" : undefined}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all resize-none ${erreurs.motivation ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-[#185FA5]"}`}
                  placeholder="Pourquoi souhaitez-vous participer à PROJEFA 2026 ? Quelles sont vos attentes et comment comptez-vous mettre à profit cette formation ?" />
              </div>
              <div className="flex items-start gap-3">
                <input id="consentement-projefa" type="checkbox" checked={formData.consentement} onChange={e => { setFormData(p => ({ ...p, consentement: e.target.checked })); effacerErreur("consentement"); }}
                  aria-invalid={Boolean(erreurs.consentement)} aria-describedby={erreurs.consentement ? "projefa-errors" : undefined}
                  className="mt-1 w-4 h-4 text-[#185FA5] rounded border-gray-300 focus:ring-[#185FA5]" />
                <label htmlFor="consentement-projefa" className="text-sm text-gray-600 dark:text-gray-400">
                  J'accepte que mes données soient utilisées par AJIHAD dans le cadre du traitement de ma candidature, conformément à la <Link href="/confidentialite" className="text-[#185FA5] underline">politique de confidentialité</Link>.
                </label>
              </div>
              <button type="submit" disabled={submitMutation.isPending}
                className="w-full btn-primary-ajihad justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {submitMutation.isPending ? "Envoi en cours..." : "Soumettre ma candidature"}
                {!submitMutation.isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

