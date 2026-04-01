import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';

export const WordPressSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [wpUrl, setWpUrl] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpAppPassword, setWpAppPassword] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('wp_url, wp_username, wp_app_password')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setWpUrl(data.wp_url || '');
          setWpUsername(data.wp_username || '');
          setWpAppPassword(data.wp_app_password || '');
        }
      } catch (error) {
        console.error('Failed to load WordPress settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validate URL format
    if (wpUrl && !wpUrl.match(/^https?:\/\/.+/)) {
      toast({
        title: 'Invalid URL',
        description: 'WordPress URL must start with http:// or https://',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          wp_url: wpUrl.trim(),
          wp_username: wpUsername.trim(),
          wp_app_password: wpAppPassword.trim(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Your WordPress credentials have been updated.',
      });
      setTestResult(null);
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!wpUrl || !wpUsername || !wpAppPassword) {
      toast({
        title: 'Missing credentials',
        description: 'Please fill in all WordPress fields before testing.',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const apiUrl = `${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`;
      const authString = btoa(`${wpUsername}:${wpAppPassword}`);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Basic ${authString}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setTestResult({
          success: true,
          message: `Successfully connected as ${userData.name || wpUsername}!`,
        });
        toast({
          title: 'Connection successful',
          description: 'WordPress credentials verified successfully.',
        });
      } else {
        const errorText = await response.text();
        setTestResult({
          success: false,
          message: `Connection failed: ${response.status} - ${errorText.substring(0, 100)}`,
        });
        toast({
          title: 'Connection failed',
          description: 'Could not verify WordPress credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      toast({
        title: 'Connection error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>WordPress Integration</CardTitle>
        <CardDescription>
          Connect your WordPress site to automatically publish posts. You'll need to create an Application Password in WordPress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to get an Application Password:</strong>
            <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm">
              <li>Log in to your WordPress admin dashboard</li>
              <li>Go to Users → Profile</li>
              <li>Scroll down to "Application Passwords"</li>
              <li>Enter a name (e.g., "OutRank Buddy") and click "Add New Application Password"</li>
              <li>Copy the generated password and paste it below</li>
            </ol>
            <a
              href="https://wordpress.org/support/article/application-passwords/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
            >
              Learn more <ExternalLink size={12} />
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="wp_url">WordPress Site URL</Label>
            <Input
              id="wp_url"
              type="url"
              placeholder="https://yoursite.com"
              value={wpUrl}
              onChange={(e) => setWpUrl(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The full URL of your WordPress site (e.g., https://example.com)
            </p>
          </div>

          <div>
            <Label htmlFor="wp_username">WordPress Username</Label>
            <Input
              id="wp_username"
              type="text"
              placeholder="admin"
              value={wpUsername}
              onChange={(e) => setWpUsername(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your WordPress admin username
            </p>
          </div>

          <div>
            <Label htmlFor="wp_app_password">Application Password</Label>
            <Input
              id="wp_app_password"
              type="password"
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
              value={wpAppPassword}
              onChange={(e) => setWpAppPassword(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Application password from WordPress (not your account password)
            </p>
          </div>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? 'default' : 'destructive'}>
            {testResult.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleTestConnection}
            variant="outline"
            disabled={testing || !wpUrl || !wpUsername || !wpAppPassword}
          >
            {testing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
