import { Link } from "wouter";
import { Heart, Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { useConfigSite } from "@/hooks/useConfigSite";

const footerLinks = {
  organisation: [
    { label: "À propos d'AJIHAD", href: "/a-propos" },
    { label: "Notre mission", href: "/a-propos#mission" },
    { label: "Nos valeurs", href: "/a-propos#valeurs" },
      { label: "Notre organisation", href: "/a-propos#equipe" },
    { label: "Gouvernance", href: "/gouvernance" },
  ],
  actions: [
    { label: "Tous nos projets", href: "/nos-actions" },
    { label: "PROJEFA 2026", href: "/projefa-2026" },
    { label: "Impact & résultats", href: "/impact" },
    { label: "Actualités", href: "/actualites" },
    { label: "Ressources", href: "/ressources" },
  ],
  impliquer: [
    { label: "Devenir membre", href: "/s-impliquer#membre" },
    { label: "Bénévolat", href: "/s-impliquer#benevole" },
    { label: "Ambassadeur", href: "/s-impliquer#ambassadeur" },
    { label: "Soutenir AJIHAD", href: "/soutenir" },
    { label: "Partenariat", href: "/s-impliquer#partenariat" },
  ],
  legal: [
    { label: "Contact", href: "/contact" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
    { label: "Code d'éthique", href: "/gouvernance#ethique" },
    { label: "Mentions légales", href: "/mentions-legales" },
  ],
};

export default function Footer() {
  const { txt } = useConfigSite();
  const currentYear = new Date().getFullYear();
  const email = txt("txt_footer_email");

  return (
    <footer className="bg-[#042C53] dark:bg-gray-950 text-white" role="contentinfo">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-9">
        <div className="grid gap-8 lg:grid-cols-[minmax(240px,0.85fr)_minmax(0,2.15fr)] lg:gap-10">
          {/* Brand column */}
          <div className="lg:pr-8">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src={`${import.meta.env.BASE_URL}images/logo-ajihad.png`}
                alt="Logo officiel de l'AJIHAD"
                className="h-12 w-12 object-contain brightness-0 invert"
                width={48}
                height={48}
              />
              <div>
                <span className="font-extrabold text-xl text-white block leading-none">AJIHAD</span>
                <span className="text-blue-300 text-xs">Association des Jeunes Intellectuels Haïtiens</span>
              </div>
            </Link>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-4 max-w-sm">
              {txt("txt_footer_description")}
            </p>
            <p className="text-[#4DBFBF] font-semibold italic text-sm mb-4">
              {txt("txt_footer_slogan")}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href={txt("txt_footer_facebook")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AJIHAD sur Facebook"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#185FA5] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={txt("txt_footer_instagram")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AJIHAD sur Instagram"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#B64926] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label="Envoyer un email à AJIHAD"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#4DBFBF] flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <nav aria-label="Liens du pied de page" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:gap-x-10 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-0">
          <div>
            <h3 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider mb-3">Organisation</h3>
            <ul className="space-y-1.5">
              {footerLinks.organisation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-100/70 hover:text-[#4DBFBF] text-xs sm:text-sm leading-snug transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider mb-3">Nos actions</h3>
            <ul className="space-y-1.5">
              {footerLinks.actions.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-100/70 hover:text-[#4DBFBF] text-xs sm:text-sm leading-snug transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider mb-3">S'impliquer</h3>
            <ul className="space-y-1.5">
              {footerLinks.impliquer.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-100/70 hover:text-[#4DBFBF] text-xs sm:text-sm leading-snug transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
          <div>
            <h3 className="font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider mb-3">Légal</h3>
            <ul className="space-y-1.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-100/70 hover:text-[#4DBFBF] text-xs sm:text-sm leading-snug transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          </nav>
        </div>
      </div>

      {/* Contact bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-blue-100/60">
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-[#4DBFBF] transition-colors">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {txt("txt_footer_localisation")}
              </span>
            </div>
            <p className="text-blue-100/50 text-xs sm:text-sm sm:text-right">
              © {currentYear} AJIHAD. Tous droits réservés.
              <span className="ml-2 inline-flex items-center gap-1">
                Fait avec <Heart className="w-3 h-3 text-[#B64926] fill-current" /> pour Haïti
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
