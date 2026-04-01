import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PageShell } from '@/components/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Loader2, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: PlanFeature[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      { text: '5 blog posts per month', included: true },
      { text: 'Basic content templates', included: true },
      { text: 'SEO optimization', included: true },
      { text: 'Draft & scheduling', included: true },
      { text: 'WordPress publishing', included: false },
      { text: 'Email notifications', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom AI training', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    popular: true,
    features: [
      { text: '50 blog posts per month', included: true },
      { text: 'All content templates', included: true },
      { text: 'Advanced SEO optimization', included: true },
      { text: 'Multi-platform publishing', included: true },
      { text: 'WordPress auto-publish', included: true },
      { text: 'Email notifications', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom AI training', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      { text: 'Unlimited blog posts', included: true },
      { text: 'All premium templates', included: true },
      { text: 'Advanced SEO & analytics', included: true },
      { text: 'Multi-platform publishing', included: true },
      { text: 'WordPress auto-publish', included: true },
      { text: 'Real-time notifications', included: true },
      { text: 'Priority phone & chat support', included: true },
      { text: 'Custom AI model training', included: true },
    ],
  },
];

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [quotaInfo, setQuotaInfo] = useState({ used: 0, total: 5 });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchSubscriptionInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier, posts_used_this_month, posts_quota_monthly')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setCurrentPlan(data.subscription_tier || 'free');
          setQuotaInfo({
            used: data.posts_used_this_month || 0,
            total: data.posts_quota_monthly || 5,
          });
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upgrade your plan.',
        variant: 'destructive',
      });
      return;
    }

    if (planId === currentPlan) {
      toast({
        title: 'Already subscribed',
        description: 'You are already on this plan.',
      });
      return;
    }

    setProcessingPlan(planId);

    try {
      // In a real implementation, this would:
      // 1. Create a Stripe checkout session
      // 2. Redirect to Stripe's hosted checkout page
      // 3. Handle the webhook callback to update subscription
      
      // For now, we'll simulate the upgrade for demo purposes
      const plan = PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Invalid plan');

      const newQuota = planId === 'free' ? 5 : planId === 'pro' ? 50 : 999999;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: planId,
          posts_quota_monthly: newQuota,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentPlan(planId);
      setQuotaInfo({ ...quotaInfo, total: newQuota });

      toast({
        title: 'Plan updated!',
        description: `You are now on the ${plan.name} plan.`,
      });
    } catch (error) {
      toast({
        title: 'Upgrade failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </PageShell>
    );
  }

  const usagePercentage = (quotaInfo.used / quotaInfo.total) * 100;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Scale your content creation with the right plan for your needs
          </p>
        </div>

        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Current Usage
              </CardTitle>
              <CardDescription>
                You are on the <strong className="capitalize">{currentPlan}</strong> plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Posts this month</span>
                  <span className="font-medium">
                    {quotaInfo.used} / {currentPlan === 'enterprise' ? '∞' : quotaInfo.total}
                  </span>
                </div>
                {currentPlan !== 'enterprise' && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usagePercentage >= 90 ? 'bg-destructive' : 
                        usagePercentage >= 70 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                )}
                {usagePercentage >= 80 && currentPlan !== 'enterprise' && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have used {usagePercentage.toFixed(0)}% of your monthly quota. 
                      Consider upgrading to continue creating content.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isProcessing = processingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="bg-background">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check
                          size={18}
                          className={`flex-shrink-0 mt-0.5 ${
                            feature.included ? 'text-primary' : 'text-muted-foreground opacity-30'
                          }`}
                        />
                        <span className={!feature.included ? 'text-muted-foreground line-through' : ''}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={isCurrentPlan || isProcessing || !user}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : user ? (
                      plan.price === 0 ? 'Downgrade' : 'Upgrade'
                    ) : (
                      'Sign In to Subscribe'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="text-primary" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Secure billing powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> This is a demo version. In production, billing would be handled through 
                Stripe's secure checkout system. All transactions would be encrypted and PCI compliant.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default Billing;
