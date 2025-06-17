import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TherapistCarousel from "../components/TherapistCarousel";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const userData = {
  leo: {
    progressMessage: "Today morning, you learned different fruits and how to spell them. Let's continue the winning streak and learn more.",
    therapistNames: "Cindy, Kathy, Laura",
    therapistImages: "Cindy.png, Kathy.png, Laura.png",
    therapistProjects: "68229be37a67b7ee533b7be4,68229a877a67b7ee533b7b79,682297c17a67b7ee533b7a4a",
    lastInteractions: "Reviewed colors, Learned fruit names, Practiced pronounciations",
    badges: "Badge1.png",
  },
  maria: {
    progressMessage: "Hope your vacation went great. Let's start from where you left off last week. You have made a great job learning about making effective conversations.",
    therapistNames: "Amy, Lawrence",
    therapistImages: "Amy.png, Lawrence.png",
    therapistProjects: "68228fb87a67b7ee533b75b3,68235b757a67b7ee533bcaba",
    lastInteractions: "Practiced conversations, Worked on questions, Reviewed conversations",
    badges: "Badge1.png,Badge2.png,Badge3.png",
  }
};

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const voiceflowContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const { toast } = useToast();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTherapist, setActiveTherapist] = useState<string | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, [isAuthenticated, navigate]);

  const getUserProgress = () => {
    return userData[profile?.username]?.progressMessage || "Welcome back to your learning journey.";
  };

  const BadgeDisplay = ({ userData, profile }) => {
    const username = profile?.username || "";
    const badgePaths = userData[username]?.badges
      ? userData[username].badges.split(',').map((path) => path.trim())
      : [];
    
    return (
      <div className="w-full md:w-[40%]">
        <div className="bg-muted p-6 rounded-lg h-full">
          <h2 className="text-2xl font-semibold mb-6 text-left">Your Badges</h2>
          <div className="flex flex-wrap gap-2 justify-start">
            {badgePaths.length > 0 ? (
              badgePaths.map((path, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-16 w-16 mb-1">
                    <img
                      src={`/lovable-uploads/${path}`}
                      alt={`Badge ${index + 1}`}
                      className="h-full w-full rounded-lg shadow-md object-contain"
                    />
                  </div>
                  <Badge variant="secondary" className="mt-1 text-center">
                    Achievement {index + 1}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8 w-full">
                No badges earned yet. Complete your therapy sessions to earn badges!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const loadVoiceflow = (projectId: string = '681e47df6c9c534714a5f564', therapistName: string) => {
    // Clean up any previous Voiceflow container content
    if (voiceflowContainerRef.current) {
      voiceflowContainerRef.current.innerHTML = '';
    }
    
    if (scriptLoaded.current) {
      // If script is already loaded, just reinitialize with new project ID
      if (window.voiceflow && voiceflowContainerRef.current) {
        window.voiceflow.chat.load({
          verify: { projectID: projectId },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          },
          render: {
            mode: 'embedded',
            target: voiceflowContainerRef.current
          }
        });

        // Start conversation with selected therapist
        setTimeout(() => {
          if (window.voiceflow?.chat?.interact) {
            window.voiceflow.chat.interact({
              type: 'text',
              payload: `Hi, I'm ${profile?.name || 'a student'} and I'm ready to continue my learning session.`
            });
            
            toast({
              title: `${therapistName} is ready!`,
              description: `Your speech therapy assistant ${therapistName} is ready to help you.`,
            });
            setSessionActive(true);
          }
        }, 1500);
      }
      return;
    }
    
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.onload = () => {
      if (window.voiceflow && voiceflowContainerRef.current) {
        window.voiceflow.chat.load({
          verify: { projectID: projectId },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          },
          render: {
            mode: 'embedded',
            target: voiceflowContainerRef.current
          }
        });

        // Start conversation with selected therapist
        setTimeout(() => {
          if (window.voiceflow?.chat?.interact) {
            window.voiceflow.chat.interact({
              type: 'text',
              payload: `Hi, I'm ${profile?.name || 'a student'} and I'm ready to continue my learning session.`
            });
            
            toast({
              title: `${therapistName} is ready!`,
              description: `Your speech therapy assistant ${therapistName} is ready to help you.`,
            });
            setSessionActive(true);
          }
        }, 1500);
      }
    };
    
    document.body.appendChild(script);
    scriptLoaded.current = true;
  };

  const handleTherapistSelect = (projectId: string, therapistName: string) => {
    // Only check for active session if the session is actually active
    // and we're selecting a different therapist
    if (sessionActive && activeProjectId && activeProjectId !== projectId) {
      setShowSessionWarning(true);
      return;
    }
    
    setActiveProjectId(projectId);
    setActiveTherapist(therapistName);
    loadVoiceflow(projectId, therapistName);
    
    toast({
      title: `Starting your session with ${therapistName}`,
      description: `Connecting you with your therapist ${therapistName}...`,
    });
  };

  const endSession = () => {
    try {
      if (window.voiceflow && window.voiceflow.chat) {
        // Try to gracefully close the chat if possible
        try {
          window.voiceflow.chat.close();
        } catch (error) {
          console.log("Error closing Voiceflow chat:", error);
        }
        
        // Clean up Voiceflow chat container
        if (voiceflowContainerRef.current) {
          voiceflowContainerRef.current.innerHTML = '';
        }
      }
    } catch (error) {
      console.log("Error during Voiceflow cleanup:", error);
    } finally {
      // Reset states regardless of any errors
      setActiveProjectId(null);
      setActiveTherapist(null);
      setSessionActive(false);
      setShowSessionWarning(false);
      
      // Completely unload the script to ensure clean slate for next session
      scriptLoaded.current = false;
      
      // Remove the script element to ensure it's reloaded fresh next time
      const scriptElement = document.querySelector('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
      if (scriptElement) {
        scriptElement.remove();
      }
      
      toast({
        title: "Session ended",
        description: "Your therapy session has been ended successfully.",
      });
    }
  };

  const dismissWarning = () => {
    setShowSessionWarning(false);
  };

  // Get therapists count for the current user
  const getTherapistsCount = () => {
    const username = profile?.username || "";
    const userInfo = userData[username];
    if (!userInfo?.therapistNames) return 0;
    return userInfo.therapistNames.split(",").length;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Welcome, {profile?.name || "User"}!
          </h1>
          
          {showSessionWarning && (
            <Alert variant="destructive" className="mb-6 flex justify-between items-start">
              <div>
                <AlertTitle>Active Session in Progress</AlertTitle>
                <AlertDescription>
                  You already have an active session with {activeTherapist}. Please finish or end your current session before starting a new one.
                </AlertDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={dismissWarning} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}
          
          <div className="bg-muted p-6 rounded-lg mb-8 text-left">
            <h2 className="text-xl font-semibold mb-3">Your Learning Progress</h2>
            <p className="text-lg">{getUserProgress()}</p>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            {/* Therapist section - 60% width */}
            <div className="w-full md:w-[60%]">
              <div className="bg-muted p-6 rounded-lg h-full">
                <h2 className="text-2xl font-semibold mb-6 text-left">Your Therapists</h2>
                <TherapistCarousel 
                  user={{ username: profile?.username }} 
                  userData={userData} 
                  onTherapistSelect={handleTherapistSelect}
                  therapistsCount={getTherapistsCount()}
                />
              </div>
            </div>
            
            {/* Badges section - 40% width */}
            <BadgeDisplay userData={userData} profile={profile} />
          </div>
          
          {/* Show the Voiceflow container only when a therapist is selected */}
          {activeProjectId ? (
            <div className="relative">
              <div 
                ref={voiceflowContainerRef} 
                id="voiceflow-container" 
                className="w-full h-[600px] border rounded-lg"
              ></div>
              
              {/* End Session button */}
              {sessionActive && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={endSession}
                    className="bg-[#4b7cf7] text-white hover:bg-[#3a6ad0]"
                  >
                    End Session
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground">
              Select a therapist to start your session
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Add TypeScript interfaces for the global window object to include Voiceflow
declare global {
  interface Window {
    voiceflow?: {
      chat: {
        load: (config: any) => void;
        interact?: (message: { type: string; payload: string }) => void;
        close?: () => void;
      };
    };
  }
}

export default Home;
