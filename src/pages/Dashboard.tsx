import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  Save, 
  Loader2, 
  Target, 
  Eye, 
  FileText, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [orgGoals, setOrgGoals] = useState("");
  const [orgVision, setOrgVision] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Allow access without login - demo mode available

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, org_goals, org_vision")
      .eq("user_id", user!.id)
      .single();

    if (!error && data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url);
      setOrgGoals((data as any).org_goals || "");
      setOrgVision((data as any).org_vision || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        org_goals: orgGoals,
        org_vision: orgVision,
      } as any)
      .eq("user_id", user!.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your profile and personalization settings have been saved." });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(newUrl);
      toast({ title: "Avatar updated" });
    }
    setUploading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <PageShell showSignOut>
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="card-elevated p-8 space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary/8 flex items-center justify-center overflow-hidden border-2 border-border">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:brightness-110 transition-all"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground">Click the camera icon to change your avatar</p>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <div className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-muted-foreground text-sm">
            {user?.email}
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="input-base"
          />
        </div>
      </div>

      {/* Personalization Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Target size={22} className="text-primary" />
          Personalization
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Define your organization's goals and vision. These will shape your AI-generated content plan.
        </p>

        <div className="card-elevated p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Target size={16} className="text-primary" />
              Organization Goals
            </label>
            <textarea
              value={orgGoals}
              onChange={(e) => setOrgGoals(e.target.value)}
              placeholder="e.g., Become the leading fire safety provider in South India, increase online leads by 50%..."
              rows={4}
              className="input-base resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              What does your organization aim to achieve?
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Eye size={16} className="text-primary" />
              Organization Vision
            </label>
            <textarea
              value={orgVision}
              onChange={(e) => setOrgVision(e.target.value)}
              placeholder="e.g., To create a safer world through accessible, high-quality fire protection services..."
              rows={4}
              className="input-base resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your long-term vision statement.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button onClick={handleSave} disabled={saving} className="w-full btn-primary">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </PageShell>
  );
};

export default Profile;
