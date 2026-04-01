import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={20} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">BlitzNova AI</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {sent ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/auth" className="text-primary font-medium hover:underline text-sm">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-2">Reset password</h2>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
