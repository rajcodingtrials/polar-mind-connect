import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, CheckCircle2, Star } from "lucide-react";
import { useClientSessions } from "@/hooks/useClientSessions";
import AffirmationCard from "@/components/parents/AffirmationCard";
import AILearningAdventure_v2 from "@/components/parents/AILearningAdventure_v2";
import SessionReviewModal, { SessionReview } from "@/components/parents/SessionReviewModal";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ParentHome = () => {
  const { isAuthenticated, user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { upcomingSessions, completedSessions, loading: sessionsLoading, submitReview } = useClientSessions(user?.id || null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<{ id: string; therapistName: string } | null>(null);
  const [existingReview, setExistingReview] = useState<SessionReview | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check if user is a verified therapist
  useEffect(() => {
    const checkTherapistVerification = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("therapists")
          .select("is_verified")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (!error && data) {
          setIsVerified(data.is_verified || false);
        }
      } catch (error) {
        console.error("Error checking therapist verification:", error);
      }
    };

    checkTherapistVerification();
  }, [user?.id]);

  // Reset selected therapist when navigating back from AILearningAdventure
  useEffect(() => {
    if (location.state?.resetTherapist) {
      setSelectedTherapist(null);
      // Clear the state to prevent resetting on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAITherapySelect = (therapistName: string) => {
    setSelectedTherapist(therapistName);
  };

  const handleBookSession = () => {
    navigate("/consultation");
  };

  const handleOpenReview = async (session: any) => {
    const therapistName = session.therapist.name ||
      `${session.therapist.first_name} ${session.therapist.last_name}` ||
      "Therapist";
    setSelectedSessionForReview({
      id: session.id,
      therapistName,
    });

    // Fetch existing review if it exists
    if (user?.id) {
      try {
        const { data: reviewData, error } = await supabase
          .from('session_ratings')
          .select('overall_rating, usefulness_rating, communication_rating, would_recommend, what_went_well, what_can_be_improved')
          .eq('session_id', session.id)
          .eq('client_id', user.id)
          .maybeSingle();

        if (!error && reviewData) {
          setExistingReview({
            overall_rating: reviewData.overall_rating || 0,
            usefulness_rating: reviewData.usefulness_rating || 0,
            communication_rating: reviewData.communication_rating || 0,
            would_recommend: reviewData.would_recommend ?? true,
            what_went_well: reviewData.what_went_well || '',
            what_can_be_improved: reviewData.what_can_be_improved || '',
          });
        } else {
          setExistingReview(null);
        }
      } catch (error) {
        console.error('Error fetching existing review:', error);
        setExistingReview(null);
      }
    } else {
      setExistingReview(null);
    }

    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (review: SessionReview) => {
    if (!selectedSessionForReview || !user?.id) return;

    try {
      await submitReview(selectedSessionForReview.id, review);
      toast({
        title: "Review Submitted",
        description: existingReview ? "Your review has been updated!" : "Thank you for your feedback!",
      });
      setReviewModalOpen(false);
      setSelectedSessionForReview(null);
      setExistingReview(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatSessionDateTime = (date: string, startTime: string) => {
    const sessionDate = new Date(`${date}T${startTime}`);
    return {
      date: format(sessionDate, "MMM dd, yyyy"),
      time: format(sessionDate, "h:mm a"),
    };
  };

  const isSessionJoinable = (date: string, startTime: string) => {
    const sessionDate = new Date(`${date}T${startTime}`);
    const now = new Date();
    const twelveHoursBefore = new Date(sessionDate.getTime() - 12 * 60 * 60 * 1000);
    return now >= twelveHoursBefore;
  };

  const hasSessionPassed = (date: string, endTime: string) => {
    const sessionEndDate = new Date(`${date}T${endTime}`);
    const now = new Date();
    return now > sessionEndDate;
  };

  const renderAiTherapy = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        className="flex items-center space-x-6 cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 p-6 rounded-2xl transition-all duration-300 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:scale-[1.01]"
        onClick={() => handleAITherapySelect('Laura')}
      >
        <Avatar className="h-20 w-20 border-2 border-blue-200">
          <AvatarImage src="/lovable-uploads/Laura.png" alt="Laura" />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">L</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-700 text-xl mb-2">Laura 💫</h3>
          <p className="text-slate-600 text-base">Lead Speech Language Pathologist</p>
        </div>
      </div>
      <div
        className="flex items-center space-x-6 cursor-pointer bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 p-6 rounded-2xl transition-all duration-300 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-xl hover:scale-[1.01]"
        onClick={() => handleAITherapySelect('Lawrence')}
      >
        <Avatar className="h-20 w-20 border-2 border-green-200">
          <AvatarImage src="/lovable-uploads/Lawrence.png" alt="Lawrence" />
          <AvatarFallback className="bg-green-100 text-green-600 text-lg">L</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-700 text-xl mb-2">Lawrence 🌟</h3>
          <p className="text-slate-600 text-base">Associate Speech Language Pathologist</p>
        </div>
      </div>
    </div>
  );

  const renderHumanTherapy = (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-700 flex items-center justify-between">
            <span>Upcoming Sessions ({upcomingSessions.length})</span>
            <Button size="sm" variant="outline" onClick={handleBookSession}>
              Book a Session
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No upcoming sessions scheduled.</p>
              <Button onClick={handleBookSession}>Find a Therapist</Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {upcomingSessions.map((session) => {
                const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                const canJoin = isSessionJoinable(session.session_date, session.start_time);
                const hasPassed = hasSessionPassed(session.session_date, session.end_time);
                const hasMeetingLink = session.meeting_link;
                
                return (
                  <Card key={session.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="mt-1">
                        <AvatarImage src={session.therapist.avatar_url} />
                        <AvatarFallback>
                          {session.therapist.name?.charAt(0) ||
                            session.therapist.first_name?.charAt(0) ||
                            "T"}
                        </AvatarFallback>
                      </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">
                          {session.therapist.name ||
                            `${session.therapist.first_name} ${session.therapist.last_name}`}
                        </h3>
                            <div className="flex items-center text-sm text-slate-600 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                          {date} at {time}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{session.duration_minutes} minutes</p>
                            
                            {hasMeetingLink && (
                              <div className="mt-3 p-3 bg-white border border-blue-300 rounded-lg">
                                <div className="flex items-center text-sm font-medium text-blue-900 mb-2">
                                  <Video className="w-4 h-4 mr-2" />
                                  Meeting Details
                                </div>
                                {session.zoom_meeting_id && (
                                  <p className="text-xs text-slate-600 mb-1">
                                    <span className="font-medium">Meeting ID:</span> {session.zoom_meeting_id}
                                  </p>
                                )}
                                {session.zoom_password && (
                                  <p className="text-xs text-slate-600">
                                    <span className="font-medium">Password:</span> {session.zoom_password}
                                  </p>
                                )}
                              </div>
                            )}
                      </div>
                    </div>
                        
                        <div className="flex flex-col items-end gap-2 md:min-w-[140px]">
                    <Badge className={getSessionStatusColor(session.status)}>{session.status}</Badge>
                          
                          {hasMeetingLink && !hasPassed && (
                            <Button
                              onClick={() => window.open(session.meeting_link, '_blank')}
                              disabled={!canJoin}
                              className="w-full md:w-auto"
                              variant={canJoin ? "default" : "outline"}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              {canJoin ? 'Join Meeting' : 'Available 12hrs Before'}
                            </Button>
                          )}
                          
                          {!hasMeetingLink && !hasPassed && (
                            <p className="text-xs text-slate-500 text-center">
                              Meeting link will be available soon
                            </p>
                          )}
                        </div>
                  </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-700 flex items-center">
            Session History ({completedSessions.length})
          </CardTitle>
          <CardDescription>Recent sessions with your human therapists</CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <p className="text-center text-slate-600 py-8">No completed sessions yet.</p>
          ) : (
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {completedSessions.map((session) => {
                const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                return (
                  <div
                    key={session.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-blue-100 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={session.therapist.avatar_url} />
                        <AvatarFallback>
                          {session.therapist.name?.charAt(0) ||
                            session.therapist.first_name?.charAt(0) ||
                            "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {session.therapist.name ||
                            `${session.therapist.first_name} ${session.therapist.last_name}`}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {date} at {time}
                        </p>
                        <p className="text-xs text-slate-500">{session.duration_minutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <Badge className={getSessionStatusColor(session.status)}>{session.status}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReview(session)}
                        className="w-full md:w-auto"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Review Session
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  if (selectedTherapist) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        <AILearningAdventure_v2 therapistName={selectedTherapist} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="w-full space-y-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 flex items-center justify-center gap-2 flex-wrap">
            <span>Welcome, {profile?.name || profile?.username || "User"}</span>
            {isVerified && (
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 fill-blue-500" />
            )}
            <span>!</span>
          </h1>
          <AffirmationCard />
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "ai" | "human")}
                className="space-y-6"
              >
                <TabsList className="grid grid-cols-2 bg-white/40 backdrop-blur rounded-2xl shadow-sm">
                  <TabsTrigger
                    value="ai"
                    className="rounded-xl text-sm sm:text-base bg-white text-slate-700 border-2 border-transparent data-[state=active]:bg-blue-50 data-[state=inactive]:hover:bg-blue-100 hover:scale-[1.01] hover:shadow-xl transition-all duration-300"
                  >
                    AI Therapy
                  </TabsTrigger>
                  <TabsTrigger
                    value="human"
                    className="rounded-xl text-sm sm:text-base bg-white text-slate-700 border-2 border-transparent data-[state=active]:bg-blue-50 data-[state=inactive]:hover:bg-blue-100 hover:scale-[1.01] hover:shadow-xl transition-all duration-300"
                  >
                    Human Therapy
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ai">{renderAiTherapy}</TabsContent>
                <TabsContent value="human">
                  {sessionsLoading ? (
                    <div className="text-center py-12 text-slate-600">Loading your sessions...</div>
                  ) : (
                    renderHumanTherapy
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      {selectedSessionForReview && (
        <SessionReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSessionForReview(null);
            setExistingReview(null);
          }}
          onSubmit={handleSubmitReview}
          sessionId={selectedSessionForReview.id}
          therapistName={selectedSessionForReview.therapistName}
          existingReview={existingReview}
        />
      )}
    </div>
  );
};

export default ParentHome;

