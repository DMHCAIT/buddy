import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/PageShell";
import { Loader2, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import "./ContentCalendar.css";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'draft' | 'review' | 'scheduled' | 'published';
  allDay: boolean;
}

const ContentCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    if (!user) {
      // Demo data
      const demoEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'SEO Best Practices Guide',
          start: new Date(),
          end: new Date(),
          status: 'published',
          allDay: true
        },
        {
          id: '2',
          title: 'Content Marketing Strategy',
          start: moment().add(2, 'days').toDate(),
          end: moment().add(2, 'days').toDate(),
          status: 'scheduled',
          allDay: true
        },
        {
          id: '3',
          title: 'Social Media Trends 2026',
          start: moment().add(5, 'days').toDate(),
          end: moment().add(5, 'days').toDate(),
          status: 'draft',
          allDay: true
        }
      ];
      setEvents(demoEvents);
      setLoading(false);
      return;
    }

    try {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, status, publish_at, created_at')
        .eq('user_id', user.id);

      if (!error && posts) {
        const calendarEvents: CalendarEvent[] = posts.map(post => {
          const date = post.publish_at ? new Date(post.publish_at) : new Date(post.created_at);
          return {
            id: post.id,
            title: post.title || 'Untitled',
            start: date,
            end: date,
            status: post.status as any,
            allDay: true
          };
        });
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // Navigate to create post with pre-filled publish date
    navigate('/create-post', { state: { publishDate: slotInfo.start } });
  }, [navigate]);

  const handleEventDrop = async ({ event, start, end }: any) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Sign in to reschedule posts',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ publish_at: start.toISOString() })
        .eq('id', event.id);

      if (error) throw error;

      // Update local state
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, start, end } : e
      ));

      toast({
        title: 'Post Rescheduled',
        description: `Moved to ${moment(start).format('MMM DD, YYYY')}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#6b7280'; // default gray
    let borderColor = '#4b5563';

    switch (event.status) {
      case 'published':
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case 'scheduled':
        backgroundColor = '#3b82f6';
        borderColor = '#2563eb';
        break;
      case 'review':
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      case 'draft':
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '6px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: '500',
        padding: '4px 8px'
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <PageShell showSignOut>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <CalendarIcon className="text-primary" />
              Content Calendar
            </h1>
            <p className="text-muted-foreground">Visualize and manage your content schedule</p>
          </div>
          <button
            onClick={() => navigate('/create-post')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Post
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-accent/50 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded calendar-legend-published"></div>
            <span className="text-sm">Published</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded calendar-legend-scheduled"></div>
            <span className="text-sm">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded calendar-legend-review"></div>
            <span className="text-sm">Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded calendar-legend-draft"></div>
            <span className="text-sm">Draft</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-background border border-border rounded-lg p-6 calendar-container-height">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            eventPropGetter={eventStyleGetter}
            selectable
            resizable={false}
            view={view}
            onView={setView}
            views={['month', 'week', 'day', 'agenda']}
            popup
          />
        </div>

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                <div className="space-y-2 mt-4">
                  <div>
                    <span className="font-medium">Status: </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedEvent?.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      selectedEvent?.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      selectedEvent?.status === 'review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {selectedEvent?.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Date: </span>
                    {selectedEvent && moment(selectedEvent.start).format('MMMM DD, YYYY')}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        navigate('/posts');
                        setSelectedEvent(null);
                      }}
                      className="btn-secondary flex-1"
                    >
                      View All Posts
                    </button>
                    {selectedEvent && (
                      <button
                        onClick={() => {
                          navigate('/create-post', { state: { editId: selectedEvent.id } });
                          setSelectedEvent(null);
                        }}
                        className="btn-primary flex-1"
                      >
                        Edit Post
                      </button>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  );
};

export default ContentCalendar;
