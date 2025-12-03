
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import { stopAllAudio } from "./utils/audioUtils";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import MeetTheTeam from "./pages/MeetTheTeam";
import OurStory from "./pages/OurStory";
import Admin from "./pages/Admin";
import TherapistAuth from "./pages/TherapistAuth";
import TherapistPendingApproval from "./pages/TherapistPendingApproval";
import TherapistDashboard from "./pages/TherapistDashboard";
import TherapistMyProfile from "./pages/TherapistMyProfile";
import TherapistAIDemo from "./pages/TherapistAIDemo";
import TherapistAILessons from "./pages/TherapistAILessons";
import FindCoaches from "./pages/FindCoaches";
import UserDashboard from "./pages/UserDashboard";
import MyProfile from "./pages/MyProfile";
import FooterDemo from "./pages/FooterDemo";
import EmailTemplatePreview from "./pages/EmailTemplatePreview";
import EmailTemplatesPreview from "./pages/EmailTemplatesPreview";
import LessonsMarketPlace from "./pages/LessonsMarketPlace";
import HowToAddLessons from "./pages/HowToAddLessons";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Global audio cleanup effect
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🛑 Page unloading, stopping all audio...');
      stopAllAudio();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🛑 Page hidden, stopping all audio...');
        stopAllAudio();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('🛑 App component unmounting, stopping all audio...');
      stopAllAudio();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/meet-the-team" element={<MeetTheTeam />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/therapist-auth" element={<TherapistAuth />} />
              <Route path="/therapist-pending-approval" element={<TherapistPendingApproval />} />
              <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
              <Route path="/therapist-my-profile" element={<TherapistMyProfile />} />
              <Route path="/therapist/try-ai" element={<TherapistAIDemo />} />
              <Route path="/therapist/ai-lessons" element={<TherapistAILessons />} />
              <Route path="/consultation" element={<FindCoaches />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/footer-demo" element={<FooterDemo />} />
          <Route path="/email-preview" element={<EmailTemplatePreview />} />
          <Route path="/email-templates-preview" element={<EmailTemplatesPreview />} />
              <Route path="/lessons-marketplace" element={<LessonsMarketPlace />} />
              <Route path="/how-to-add-lessons" element={<HowToAddLessons />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
