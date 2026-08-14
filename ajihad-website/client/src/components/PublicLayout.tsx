import Navbar from "./Navbar";
import Footer from "./Footer";
import BandeauAnnonce from "./BandeauAnnonce";

interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PublicLayout({ children, className = "" }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <BandeauAnnonce />
      <Navbar />
      <main id="main-content" className={`flex-1 ${className}`} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

