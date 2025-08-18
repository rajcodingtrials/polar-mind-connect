
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
import OpenAIChatPage from "./pages/OpenAIChat";
import Admin from "./pages/Admin";
import TherapistAuth from "./pages/TherapistAuth";
import TherapistDashboard from "./pages/TherapistDashboard";
import Consultation from "./pages/Consultation";

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
              <Route path="/openai-chat" element={<OpenAIChatPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/therapist-auth" element={<TherapistAuth />} />
              <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
              <Route path="/consultation" element={<Consultation />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
