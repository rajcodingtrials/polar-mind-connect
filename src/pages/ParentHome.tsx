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
import { Video, Calendar, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useClientSessions } from "@/hooks/useClientSessions";
import AffirmationCard from "@/components/parents/AffirmationCard";
import AILearningAdventure_v2 from "@/components/parents/AILearningAdventure_v2";
import SessionReviewModal, { SessionReview } from "@/components/parents/SessionReviewModal";
import LessonReviewModal, { LessonReview } from "@/components/parents/LessonReviewModal";
import LessonActivityHistory from "@/components/parents/LessonActivityHistory";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLessonActivity, LessonActivity } from "@/hooks/useLessonActivity";

const ParentHome = () => {
  const { isAuthenticated, user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");
  const { upcomingSessions, completedSessions, loading: sessionsLoading, submitReview } = useClientSessions(user?.id || null);
  // Fetch lesson activities when AI therapy tab is active
  const { lessonActivities, loading: lessonActivityLoading, submitReview: submitLessonReview } = useLessonActivity(activeTab === 'ai' ? user?.id || null : null);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<{ id: string; therapistName: string } | null>(null);
  const [existingReview, setExistingReview] = useState<SessionReview | null>(null);
  const [upcomingSessionsExpanded, setUpcomingSessionsExpanded] = useState(false);
  const [sessionHistoryExpanded, setSessionHistoryExpanded] = useState(false);
  const [lessonReviewModalOpen, setLessonReviewModalOpen] = useState(false);
  const [selectedLessonForReview, setSelectedLessonForReview] = useState<{ id: string; name: string } | null>(null);
  const [existingLessonReview, setExistingLessonReview] = useState<LessonReview | null>(null);

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

  // Check sessionStorage for selected therapist (set from UserDashboard retry)
  useEffect(() => {
    const storedTherapist = sessionStorage.getItem('selectedTherapist');
    if (storedTherapist) {
      setSelectedTherapist(storedTherapist);
      // Clear sessionStorage after reading
      sessionStorage.removeItem('selectedTherapist');
    }
  }, []);

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

  const handleOpenLessonReview = async (activity: any) => {
    const lessonName = activity.lesson?.name || "Lesson";
    setSelectedLessonForReview({
      id: activity.lesson_id,
      name: lessonName,
    });

    // Fetch existing review if it exists
    if (user?.id) {
      try {
        const { data: reviewData, error } = await supabase
          .from('lesson_activity' as any)
          .select('overall_rating, usefulness_rating, communication_rating, would_recommend, what_went_well, what_can_be_improved')
          .eq('lesson_id', activity.lesson_id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && reviewData) {
          setExistingLessonReview({
            overall_rating: reviewData.overall_rating || 0,
            usefulness_rating: reviewData.usefulness_rating || 0,
            communication_rating: reviewData.communication_rating || 0,
            would_recommend: reviewData.would_recommend ?? true,
            what_went_well: reviewData.what_went_well || '',
            what_can_be_improved: reviewData.what_can_be_improved || '',
          });
        } else {
          setExistingLessonReview(null);
        }
      } catch (error) {
        console.error('Error fetching existing lesson review:', error);
        setExistingLessonReview(null);
      }
    } else {
      setExistingLessonReview(null);
    }

    setLessonReviewModalOpen(true);
  };

  const handleSubmitLessonReview = async (review: LessonReview) => {
    if (!selectedLessonForReview || !user?.id) return;

    try {
      await submitLessonReview(selectedLessonForReview.id, review);
      toast({
        title: "Review Submitted",
        description: existingLessonReview ? "Your review has been updated!" : "Thank you for your feedback!",
      });
      setLessonReviewModalOpen(false);
      setSelectedLessonForReview(null);
      setExistingLessonReview(null);
    } catch (error) {
      console.error("Error submitting lesson review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetryLesson = (lessonId: string, questionType: string) => {
    // Set therapist and store lesson info in sessionStorage for AILearningAdventure to pick up
    setSelectedTherapist('Laura'); // Default therapist
    sessionStorage.setItem('retryLesson', JSON.stringify({
      lessonId,
      questionType,
      timestamp: Date.now()
    }));
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

  // Define alternating row styles with two shades of blue/gray
  const getRowStyle = (index: number) => {
    const isEven = index % 2 === 0;
    return {
      bgColor: isEven ? 'bg-blue-50' : 'bg-slate-50',
      hoverColor: isEven ? 'hover:bg-blue-100' : 'hover:bg-slate-100',
      textColor: isEven ? 'text-blue-900' : 'text-slate-900',
    };
  };


  const renderAiTherapy = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="flex items-center space-x-6 cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 p-6 rounded-2xl transition-all duration-300 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:scale-[1.01]"
          onClick={() => handleAITherapySelect('Laura')}
        >
          <Avatar className="h-20 w-20 border-2 border-blue-200">
            <AvatarImage src="/lovable-uploads/Laura.png" alt="Laura - Lead Speech Language Pathologist AI Therapist" />
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
            <AvatarImage src="/lovable-uploads/Lawrence.png" alt="Lawrence - Associate Speech Language Pathologist AI Therapist" />
            <AvatarFallback className="bg-green-100 text-green-600 text-lg">L</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-700 text-xl mb-2">Lawrence 🌟</h3>
            <p className="text-slate-600 text-base">Associate Speech Language Pathologist</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Sort upcoming sessions: earliest first
  const sortedUpcomingSessions = [...upcomingSessions].sort((a, b) => {
    const dateA = new Date(`${a.session_date}T${a.start_time}`);
    const dateB = new Date(`${b.session_date}T${b.start_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Sort completed sessions: most recent first
  const sortedCompletedSessions = [...completedSessions].sort((a, b) => {
    const dateA = new Date(`${a.session_date}T${a.start_time}`);
    const dateB = new Date(`${b.session_date}T${b.start_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Get visible sessions based on expanded state
  const visibleUpcomingSessions = upcomingSessionsExpanded 
    ? sortedUpcomingSessions 
    : sortedUpcomingSessions.slice(0, 3);
  
  const visibleCompletedSessions = sessionHistoryExpanded 
    ? sortedCompletedSessions 
    : sortedCompletedSessions.slice(0, 3);

  const renderHumanTherapy = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl font-bold text-slate-700 text-left">Upcoming Sessions ({upcomingSessions.length})</h2>
          <Button size="sm" variant="outline" onClick={handleBookSession}>
            Book a Session
          </Button>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-slate-600 mb-4">No upcoming sessions scheduled.</p>
            <Button onClick={handleBookSession}>Find a Therapist</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Therapist</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Meeting</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visibleUpcomingSessions.map((session, index) => {
                  const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                  const canJoin = isSessionJoinable(session.session_date, session.start_time);
                  const hasPassed = hasSessionPassed(session.session_date, session.end_time);
                  const hasMeetingLink = session.meeting_link;
                  const rowStyle = getRowStyle(index);
                  
                  return (
                    <tr
                      key={session.id}
                      className={`${rowStyle.bgColor} ${rowStyle.hoverColor} ${rowStyle.textColor} transition-all duration-300 cursor-pointer`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border-2 border-white flex-shrink-0">
                            <AvatarImage src={session.therapist.avatar_url} />
                            <AvatarFallback className="bg-white text-slate-600 text-sm">
                              {session.therapist.name?.charAt(0) ||
                                session.therapist.first_name?.charAt(0) ||
                                "T"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">
                              {session.therapist.name ||
                                `${session.therapist.first_name} ${session.therapist.last_name}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{date} • {time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-left">
                        {session.duration_minutes} min
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        <Badge className={`${getSessionStatusColor(session.status)} text-xs`}>
                          {session.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-left">
                        {hasMeetingLink ? (
                          <div className="text-xs">
                            {session.zoom_meeting_id && (
                              <div className="mb-1">
                                <span className="font-medium">ID:</span> {session.zoom_meeting_id}
                              </div>
                            )}
                            {session.zoom_password && (
                              <div>
                                <span className="font-medium">Pass:</span> {session.zoom_password}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs opacity-70">Not available</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        {hasMeetingLink && !hasPassed && (
                          <Button
                            onClick={() => window.open(session.meeting_link, '_blank')}
                            disabled={!canJoin}
                            variant={canJoin ? "default" : "outline"}
                            size="sm"
                          >
                            <Video className="w-3 h-3 mr-2" />
                            {canJoin ? 'Join' : '12hrs'}
                          </Button>
                        )}
                        {!hasMeetingLink && !hasPassed && (
                          <span className="text-xs opacity-70">Coming soon</span>
                        )}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            {sortedUpcomingSessions.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingSessionsExpanded(!upcomingSessionsExpanded)}
                  className="flex items-center gap-2"
                >
                  {upcomingSessionsExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show All ({sortedUpcomingSessions.length - 3} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
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
            <span>Welcome, {profile?.name || profile?.username || "User"}!</span>
          </h1>
          <AffirmationCard />
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "ai" | "human")}
                className="space-y-6"
              >
                <TabsList className="grid grid-cols-2 gap-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-1.5">
                  <TabsTrigger
                    value="ai"
                    className="rounded-xl text-sm sm:text-base font-medium border-2 border-transparent transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-indigo-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border-blue-200 data-[state=inactive]:bg-white/80 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-gradient-to-r data-[state=inactive]:hover:from-blue-50 data-[state=inactive]:hover:to-indigo-50 data-[state=inactive]:hover:text-blue-600 hover:scale-[1.02]"
                  >
                    AI Therapy
                  </TabsTrigger>
                  <TabsTrigger
                    value="human"
                    className="rounded-xl text-sm sm:text-base font-medium border-2 border-transparent transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-indigo-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border-blue-200 data-[state=inactive]:bg-white/80 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-gradient-to-r data-[state=inactive]:hover:from-blue-50 data-[state=inactive]:hover:to-indigo-50 data-[state=inactive]:hover:text-blue-600 hover:scale-[1.02]"
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
      {selectedLessonForReview && (
        <LessonReviewModal
          isOpen={lessonReviewModalOpen}
          onClose={() => {
            setLessonReviewModalOpen(false);
            setSelectedLessonForReview(null);
            setExistingLessonReview(null);
          }}
          onSubmit={handleSubmitLessonReview}
          lessonId={selectedLessonForReview.id}
          lessonName={selectedLessonForReview.name}
          existingReview={existingLessonReview}
        />
      )}
    </div>
  );
};

export default ParentHome;

