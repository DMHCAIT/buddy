import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#features", isRoute: false, authOnly: false },
  { label: "How It Works", href: "#how-it-works", isRoute: false, authOnly: false },
  { label: "Pricing", href: "#pricing", isRoute: false, authOnly: false },
  { label: "Dashboard", href: "/dashboard", isRoute: true },
  { label: "Billing", href: "/billing", isRoute: true },
  { label: "Analyze My Site", href: "/get-started", isRoute: true },
  { label: "SERP Analysis", href: "/seo-analysis", isRoute: true },
  { label: "Content Plan", href: "/content-plan", isRoute: true },
  { label: "Today's Blog", href: "/todays-blog", isRoute: true },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Show all links - no auth filtering needed since demo mode works
  const filteredLinks = navLinks;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Sparkles size={18} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">BlitzNova AI</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {filteredLinks.map((link) =>
            link.isRoute ? (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Profile
              </button>
              <button
                onClick={() => signOut()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/seo-analysis")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Try Demo
              </button>
              <button
                onClick={() => navigate("/get-started")}
                className="bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:brightness-110 shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {filteredLinks.map((link) =>
                link.isRoute ? (
                  <button
                    key={link.label}
                    onClick={() => { navigate(link.href); setMobileOpen(false); }}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="pt-2 border-t border-border">
                {user ? (
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { navigate("/seo-analysis"); setMobileOpen(false); }}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left"
                    >
                      Try Demo
                    </button>
                    <button
                      onClick={() => { navigate("/get-started"); setMobileOpen(false); }}
                      className="bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-xl text-center"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
