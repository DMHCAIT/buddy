import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border">
      {/* CTA Banner */}
      <div className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to grow your traffic on <span className="text-gradient">auto-pilot?</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Join thousands of businesses already using BlitzNova AI to dominate search results.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="hero-btn-primary mt-8 inline-flex items-center gap-2"
          >
            Get Started for Free <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold">BlitzNova AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <span className="text-xs text-muted-foreground">© 2026 BlitzNova AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
