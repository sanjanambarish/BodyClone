import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass-card border-b border-border/30 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="font-heading text-xl md:text-2xl font-bold">
              <span className="text-foreground">BODY</span>
              <span className="text-gradient">CLONE</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: "Features", href: "#features" },
                { label: "Technology", href: "#technology" },
                { label: "Pricing", href: "#" },
                { label: "About", href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith("#") && item.href !== "#") {
                      e.preventDefault();
                      document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="font-body text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate('/auth?mode=signup')}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass-card border-b border-border/30"
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {[
              { label: "Features", href: "#features" },
              { label: "Technology", href: "#technology" },
              { label: "Pricing", href: "#" },
              { label: "About", href: "#" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("#") && item.href !== "#") {
                    e.preventDefault();
                    setIsOpen(false);
                    document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="font-body text-lg uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Button variant="ghost" className="w-full" onClick={() => { setIsOpen(false); navigate('/auth'); }}>
                Sign In
              </Button>
              <Button variant="hero" className="w-full" onClick={() => { setIsOpen(false); navigate('/auth?mode=signup'); }}>
                Get Started
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
