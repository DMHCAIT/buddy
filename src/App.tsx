import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Analytics";
import ContentCalendar from "./pages/ContentCalendar";
import Billing from "./pages/Billing";
import CreatePost from "./pages/CreatePost";
import Posts from "./pages/Posts";
import NotFound from "./pages/NotFound";
import GetStarted from "./pages/GetStarted";
import ContentPlan from "./pages/ContentPlan";
import SeoAnalysis from "./pages/SeoAnalysis";
import TodaysBlog from "./pages/TodaysBlog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/calendar" element={<ContentCalendar />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/content-plan" element={<ContentPlan />} />
            <Route path="/seo-analysis" element={<SeoAnalysis />} />
            <Route path="/todays-blog" element={<TodaysBlog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
