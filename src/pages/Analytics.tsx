import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  Loader2,
  Eye,
  Target
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface PostStats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  review: number;
}

interface ActivityData {
  date: string;
  posts: number;
}

const COLORS = {
  published: '#10b981',
  draft: '#6b7280',
  scheduled: '#3b82f6',
  review: '#f59e0b'
};

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    review: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) {
      // Demo data for non-authenticated users
      setStats({
        total: 24,
        published: 12,
        drafts: 8,
        scheduled: 3,
        review: 1
      });
      
      const demoActivity = Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        posts: Math.floor(Math.random() * 5) + 1
      }));
      setActivityData(demoActivity);
      
      setRecentPosts([
        { title: "SEO Best Practices Guide", status: "published", created_at: new Date().toISOString() },
        { title: "Content Marketing Strategy", status: "draft", created_at: new Date().toISOString() },
        { title: "Social Media Trends 2026", status: "scheduled", created_at: new Date().toISOString() }
      ]);
      
      setLoading(false);
      return;
    }

    try {
      // Fetch post statistics
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('status, created_at, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && posts) {
        const statsData: PostStats = {
          total: posts.length,
          published: posts.filter(p => p.status === 'published').length,
          drafts: posts.filter(p => p.status === 'draft').length,
          scheduled: posts.filter(p => p.status === 'scheduled').length,
          review: posts.filter(p => p.status === 'review').length
        };
        setStats(statsData);

        // Calculate last 7 days activity
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
          const count = posts.filter(p => {
            const postDate = format(startOfDay(new Date(p.created_at)), 'yyyy-MM-dd');
            return postDate === dateStr;
          }).length;
          
          return {
            date: format(date, 'MMM dd'),
            posts: count
          };
        });
        setActivityData(last7Days);

        // Recent posts
        setRecentPosts(posts.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusDistribution = [
    { name: 'Published', value: stats.published, color: COLORS.published },
    { name: 'Drafts', value: stats.drafts, color: COLORS.draft },
    { name: 'Scheduled', value: stats.scheduled, color: COLORS.scheduled },
    { name: 'Review', value: stats.review, color: COLORS.review }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <PageShell showSignOut>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your content performance and activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground">Live content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              <p className="text-xs text-muted-foreground">Ready to publish</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Activity</CardTitle>
              <CardDescription>Posts created per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Content Status Distribution</CardTitle>
              <CardDescription>Posts by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium">{post.title || 'Untitled'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(post.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        post.status === 'review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No posts yet. Create your first post to see analytics!</p>
                  <button
                    onClick={() => navigate('/create-post')}
                    className="mt-4 btn-primary"
                  >
                    Create Post
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/create-post')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create New Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate AI-powered blog content</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/seo-analysis')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SEO Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Analyze keywords and competitors</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/content-plan')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate 30-day content calendar</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default Analytics;
