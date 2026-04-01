import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, ArrowLeft, LogOut } from "lucide-react";

interface PageShellProps {
  children: ReactNode;
  /** Extra buttons/actions for the header right side */
  headerActions?: ReactNode;
  /** Back button destination, defaults to "/" */
  backTo?: string;
  /** Back button label */
  backLabel?: string;
  /** Use wide content container (max-w-4xl vs max-w-3xl) */
  wide?: boolean;
  /** Show sign out button in header */
  showSignOut?: boolean;
  /** Hide back button */
  hideBack?: boolean;
}

export const PageShell = ({
  children,
  headerActions,
  backTo = "/",
  backLabel = "Back to home",
  wide = false,
  showSignOut = false,
  hideBack = false,
}: PageShellProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <Sparkles size={18} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">BlitzNova AI</span>
          </a>
          <div className="flex items-center gap-3">
            {headerActions}
            {showSignOut && (
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={wide ? "page-content-wide" : "page-content"}>
        {!hideBack && (
          <button
            onClick={() => navigate(backTo)}
            className="back-button"
          >
            <ArrowLeft size={16} /> {backLabel}
          </button>
        )}
        <div className="page-enter">
          {children}
        </div>
      </div>
    </div>
  );
};
