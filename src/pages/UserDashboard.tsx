import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClientSessions } from "@/hooks/useClientSessions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLessonActivity } from "@/hooks/useLessonActivity";
import { useUserRole } from "@/hooks/useUserRole";
import Header from "@/components/Header";
import TherapistHeader from "@/components/therapist/TherapistHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  Star, 
  FileText, 
  BookOpen,
  TrendingUp,
  Timer,
  Flame,
  Video,
  Calendar,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  User
} from "lucide-react";
import { format } from "date-fns";
import SessionRatingModal from "@/components/parents/SessionRatingModal";
import SessionReviewModal, { SessionReview } from "@/components/parents/SessionReviewModal";
import LessonReviewModal, { LessonReview } from "@/components/parents/LessonReviewModal";
import LessonActivityHistory from "@/components/parents/LessonActivityHistory";
import UserProfileEditor from "@/components/parents/UserProfileEditor";
import BookingModal from "@/components/therapist/BookingModal";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserDashboardProps {
  userId: string; // User ID to use for dashboard data
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isTherapist } = useUserRole();
  const { upcomingSessions, completedSessions, sessionRatings, loading, submitRating, submitReview } = useClientSessions(userId || null);
  const { lessonActivities, loading: lessonActivityLoading, submitReview: submitLessonReview } = useLessonActivity(userId || null);
  
  // Determine if we should show therapist header (therapist viewing someone else's dashboard)
  const showTherapistHeader = isTherapist() && user?.id && userId && user.id !== userId;
  const [currentTherapistId, setCurrentTherapistId] = useState<string | null>(null);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'ratings' | 'profile'>('dashboard');
  const [sessionHistoryExpanded, setSessionHistoryExpanded] = useState(false);
  const [lessonReviewModalOpen, setLessonReviewModalOpen] = useState(false);
  const [selectedLessonForReview, setSelectedLessonForReview] = useState<{ id: string; name: string } | null>(null);
  const [existingLessonReview, setExistingLessonReview] = useState<LessonReview | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<{ id: string; therapistName: string } | null>(null);
  const [existingReview, setExistingReview] = useState<SessionReview | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTherapistForBooking, setSelectedTherapistForBooking] = useState<any | null>(null);
  const [childName, setChildName] = useState("");
  const [speechSkill, setSpeechSkill] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'sessions', 'ratings', 'profile'].includes(tab)) {
      setActiveTab(tab as 'dashboard' | 'sessions' | 'ratings' | 'profile');
    }
  }, [location.search]);

  // Fetch current therapist ID when viewing a linked parent's dashboard
  useEffect(() => {
    const fetchTherapistId = async () => {
      if (showTherapistHeader && user?.id) {
        try {
          const { data, error } = await (supabase
            .from('therapists' as any)
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle() as any);

          if (!error && data) {
            setCurrentTherapistId((data as any).id);
          } else {
            setCurrentTherapistId(null);
          }
        } catch (error) {
          console.error('Error fetching therapist ID:', error);
          setCurrentTherapistId(null);
        }
      } else {
        setCurrentTherapistId(null);
      }
    };

    fetchTherapistId();
  }, [showTherapistHeader, user?.id]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="flex-grow p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4 text-slate-700">Loading...</h1>
              <p className="text-slate-600">Please wait while we load your dashboard.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSessionRating = (sessionId: string) => {
    return sessionRatings.find(r => r.session_id === sessionId);
  };

  const formatSessionDateTime = (date: string, startTime: string) => {
    const sessionDate = new Date(`${date}T${startTime}`);
    return {
      date: format(sessionDate, 'MMM dd, yyyy'),
      time: format(sessionDate, 'h:mm a')
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

  // Filter sessions to only show current therapist's sessions when viewing linked parent's dashboard
  const filteredCompletedSessions = showTherapistHeader && currentTherapistId
    ? completedSessions.filter(session => session.therapist?.id === currentTherapistId)
    : completedSessions;

  const filteredUpcomingSessions = showTherapistHeader && currentTherapistId
    ? upcomingSessions.filter(session => session.therapist?.id === currentTherapistId)
    : upcomingSessions;

  // Sort completed sessions: most recent first
  const sortedCompletedSessions = [...filteredCompletedSessions].sort((a, b) => {
    const dateA = new Date(`${a.session_date}T${a.start_time}`);
    const dateB = new Date(`${b.session_date}T${b.start_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Get visible sessions based on expanded state
  const visibleCompletedSessions = sessionHistoryExpanded 
    ? sortedCompletedSessions 
    : sortedCompletedSessions.slice(0, 3);

  const handleOpenLessonReview = async (activity: any) => {
    const lessonName = activity.lesson?.name || "Lesson";
    setSelectedLessonForReview({
      id: activity.lesson_id,
      name: lessonName,
    });

    // Fetch existing review if it exists
    if (userId) {
      try {
        const { data: reviewData, error } = await supabase
          .from('lesson_activity' as any)
          .select('overall_rating, usefulness_rating, communication_rating, would_recommend, what_went_well, what_can_be_improved')
          .eq('lesson_id', activity.lesson_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && reviewData) {
          const rd = reviewData as any;
          setExistingLessonReview({
            overall_rating: rd.overall_rating || 0,
            usefulness_rating: rd.usefulness_rating || 0,
            communication_rating: rd.communication_rating || 0,
            would_recommend: rd.would_recommend ?? true,
            what_went_well: rd.what_went_well || '',
            what_can_be_improved: rd.what_can_be_improved || '',
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
    if (!selectedLessonForReview || !userId) return;

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
    sessionStorage.setItem('retryLesson', JSON.stringify({
      lessonId,
      questionType,
      timestamp: Date.now()
    }));
    // Set default therapist so ParentHome will render AILearningAdventure_v2
    sessionStorage.setItem('selectedTherapist', 'Laura');
    navigate('/home');
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
    if (userId) {
      try {
        const { data: reviewData, error } = await supabase
          .from('session_ratings')
          .select('overall_rating, usefulness_rating, communication_rating, would_recommend, what_went_well, what_can_be_improved')
          .eq('session_id', session.id)
          .eq('client_id', userId)
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
    if (!selectedSessionForReview || !userId) return;

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

  const handleBookAgain = async (session: any) => {
    // Fetch full therapist data for booking
    try {
      const { data: therapistData, error } = await supabase
        .from('therapists')
        .select('id, first_name, last_name, hourly_rate_30min, hourly_rate_60min, timezone')
        .eq('id', session.therapist_id)
        .single();

      if (error || !therapistData) {
        toast({
          title: "Error",
          description: "Could not load therapist information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSelectedTherapistForBooking(therapistData);
      setBookingModalOpen(true);
    } catch (error) {
      console.error("Error fetching therapist data:", error);
      toast({
        title: "Error",
        description: "Failed to load therapist information.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats (use filtered sessions when therapist is viewing)
  const totalCompletedSessions = filteredCompletedSessions.length;
  const totalTimeMinutes = filteredCompletedSessions.reduce((acc, session) => acc + (session.duration_minutes || 0), 0);
  const totalTimeHours = Math.round(totalTimeMinutes / 60 * 10) / 10;
  const streakDays = 5; // This would be calculated based on consecutive days
  const averageRating = sessionRatings.length > 0 
    ? Math.round((sessionRatings.reduce((acc, rating) => acc + rating.rating, 0) / sessionRatings.length) * 10) / 10
    : 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Learning Progress Section */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-blue-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-700">Progress Rating</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {averageRating > 0 ? `${averageRating}/5` : 'N/A'}
                          </p>
                          <p className="text-xs text-blue-600">Average rating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <BookOpen className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-700">Lessons Completed</p>
                          <p className="text-2xl font-bold text-purple-900">{totalCompletedSessions}</p>
                          <p className="text-xs text-purple-600">Total sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-orange-100">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Flame className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-orange-700">Streak</p>
                          <p className="text-2xl font-bold text-orange-900">{streakDays} days</p>
                          <p className="text-xs text-orange-600">Current streak</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-green-100">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Timer className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-700">Total Time</p>
                          <p className="text-2xl font-bold text-green-900">{totalTimeHours}h</p>
                          <p className="text-xs text-green-600">Hours completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Personalize Section */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personalize
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="child-name" className="text-slate-700 font-medium">
                      Child Name
                    </Label>
                    <Input
                      id="child-name"
                      type="text"
                      placeholder="Enter child's name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="speech-skill" className="text-slate-700 font-medium">
                      Current Speech Skills
                    </Label>
                    <select
                      id="speech-skill"
                      value={speechSkill}
                      onChange={(e) => setSpeechSkill(e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                    >
                      <option value="">Select speech skill level</option>
                      <option value="non_verbal">Non verbal (no words)</option>
                      <option value="pre_verbal">Pre verbal (up to 10 words)</option>
                      <option value="verbal">Verbal (can make sentences)</option>
                      <option value="conversational">Conversational (can communicate in paragraphs)</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={async () => {
                      if (!childName.trim()) {
                        toast({
                          title: "Error",
                          description: "Please enter the child's name.",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (!speechSkill) {
                        toast({
                          title: "Error",
                          description: "Please select the current speech skill level.",
                          variant: "destructive",
                        });
                        return;
                      }

                      try {
                        // Get all default lessons from lessons_v2 table
                        const { data: defaultLessonsData, error: defaultError } = await supabase
                          .from('lessons_v2' as any)
                          .select('id')
                          .eq('is_default', true)
                          .eq('is_verified', true);

                        if (defaultError) {
                          console.error('Error fetching default lessons:', defaultError);
                          toast({
                            title: "Error",
                            description: "Failed to fetch default lessons. Please try again.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Get user's lessons from parents table
                        const { data: parentData, error: parentError } = await supabase
                          .from('parents' as any)
                          .select('lessons')
                          .eq('user_id', userId)
                          .maybeSingle();

                        if (parentError && parentError.code !== 'PGRST116') {
                          console.error('Error fetching parent lessons:', parentError);
                          toast({
                            title: "Error",
                            description: "Failed to fetch your lessons. Please try again.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Extract default lesson IDs
                        const defaultLessonIds: string[] = [];
                        if (defaultLessonsData && Array.isArray(defaultLessonsData)) {
                          for (const lesson of defaultLessonsData) {
                            if ((lesson as any)?.id) {
                              defaultLessonIds.push((lesson as any).id);
                            }
                          }
                        }

                        // Extract user's custom lesson IDs
                        const userLessonIds: string[] = [];
                        if (parentData) {
                          try {
                            const record = parentData as { lessons?: string | null };
                            if (record && record.lessons && typeof record.lessons === 'string' && record.lessons.trim() !== '') {
                              userLessonIds.push(...record.lessons.split(',').map(id => id.trim()).filter(id => id));
                            }
                          } catch (e) {
                            console.error('Error parsing parent lessons:', e);
                          }
                        }

                        // Combine and deduplicate lesson IDs
                        const allLessonIds = [...new Set([...defaultLessonIds, ...userLessonIds])];

                        if (allLessonIds.length === 0) {
                          toast({
                            title: "Error",
                            description: "No lessons available to create a lesson plan. Please contact support.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Select 20 lessons at random (or all if less than 20)
                        const selectedLessons = allLessonIds
                          .sort(() => Math.random() - 0.5) // Shuffle array
                          .slice(0, Math.min(20, allLessonIds.length));

                        // Create comma-separated list
                        const lessonPlanString = selectedLessons.join(',');

                        // Check if current user is a therapist viewing someone else's dashboard
                        const isTherapistUpdatingLinkedParent = showTherapistHeader && user?.id && userId && user.id !== userId;

                        let updateError = null;
                        if (isTherapistUpdatingLinkedParent) {
                          // Use the database function for therapists updating linked parents
                          const { error } = await (supabase.rpc as any)('update_parent_lesson_plan', {
                            _parent_user_id: userId,
                            _lesson_plan: lessonPlanString
                          });
                          updateError = error;
                        } else {
                          // Direct table access for parents updating their own lesson plan
                          const { error } = await supabase
                            .from('parents' as any)
                            .upsert({
                              user_id: userId,
                              lesson_plan: lessonPlanString,
                            }, {
                              onConflict: 'user_id'
                            });
                          updateError = error;
                        }

                        if (updateError) {
                          console.error('Error saving lesson plan:', updateError);
                          toast({
                            title: "Error",
                            description: "Failed to save lesson plan. Please try again.",
                            variant: "destructive",
                          });
                          return;
                        }

                        toast({
                          title: "Success",
                          description: `Personalized lesson plan created with ${selectedLessons.length} lessons!`,
                        });
                      } catch (error) {
                        console.error('Error creating lesson plan:', error);
                        toast({
                          title: "Error",
                          description: "An unexpected error occurred. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Personalized Lesson Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Past Sessions Section */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Past Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* AI Therapy Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-4 px-4 text-left">AI Therapy</h3>
                    <LessonActivityHistory
                      lessonActivities={lessonActivities}
                      loading={lessonActivityLoading}
                      onReviewClick={handleOpenLessonReview}
                      onRetryLesson={handleRetryLesson}
                      hideTitle={true}
                    />
                  </div>

                  {/* Human Therapy Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-4 px-4 text-left">Human Therapy</h3>
                    {filteredCompletedSessions.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-slate-600">No completed sessions yet.</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full table-fixed min-w-[640px]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-64">Therapist</th>
                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-56">Date & Time</th>
                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Status</th>
                                <th className="px-2 sm:px-4 pr-4 sm:pr-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-52 min-w-[200px]">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {visibleCompletedSessions.map((session, index) => {
                              const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                              const rowStyle = getRowStyle(index);
                              
                              return (
                                <tr
                                  key={session.id}
                                  className={`${rowStyle.bgColor} ${rowStyle.hoverColor} ${rowStyle.textColor} transition-all duration-300 cursor-pointer`}
                                >
                                  <td className="px-2 sm:px-4 py-3 text-left w-64">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white flex-shrink-0">
                                        <AvatarImage src={session.therapist.avatar_url} />
                                        <AvatarFallback className="bg-white text-slate-600 text-xs sm:text-sm">
                                          {session.therapist.name?.charAt(0) ||
                                            session.therapist.first_name?.charAt(0) ||
                                            "T"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0">
                                        <div className="font-bold text-xs sm:text-sm truncate">
                                          {session.therapist.name ||
                                            `${session.therapist.first_name} ${session.therapist.last_name}`}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 text-left w-56">
                                    <div className="flex items-center text-xs sm:text-sm">
                                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                      <span className="whitespace-nowrap">{date} • {time}</span>
                                    </div>
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 text-left w-32">
                                    <Badge className={`${getSessionStatusColor(session.status)} text-xs`}>
                                      {session.status}
                                    </Badge>
                                  </td>
                                  <td className="px-2 sm:px-4 pr-4 sm:pr-6 py-3 text-left w-52 min-w-[200px]">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenReview(session)}
                                        className="text-xs px-2 sm:px-3 flex-shrink-0"
                                      >
                                        <Star className="w-3 h-3 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Review</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBookAgain(session)}
                                        className="text-xs px-2 sm:px-3 flex-shrink-0"
                                      >
                                        <RotateCcw className="w-3 h-3 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Book Again</span>
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {sortedCompletedSessions.length > 3 && (
                          <div className="mt-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSessionHistoryExpanded(!sessionHistoryExpanded)}
                              className="flex items-center gap-2"
                            >
                              {sessionHistoryExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show All ({sortedCompletedSessions.length - 3} more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Upcoming Sessions ({filteredUpcomingSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUpcomingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No upcoming sessions scheduled.</p>
                    <Button onClick={() => window.location.href = '/consultation'}>
                      Book a Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUpcomingSessions.map((session) => {
                      const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                      const canJoin = isSessionJoinable(session.session_date, session.start_time);
                      const hasPassed = hasSessionPassed(session.session_date, session.end_time);
                      const hasMeetingLink = session.meeting_link;
                      
                      return (
                        <Card key={session.id} className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="flex items-start space-x-4">
                                <Avatar className="mt-1">
                                  <AvatarImage src={session.therapist.avatar_url} />
                                  <AvatarFallback>
                                    {session.therapist.name?.charAt(0) || session.therapist.first_name?.charAt(0) || 'T'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-medium text-slate-900">
                                    {session.therapist.name || `${session.therapist.first_name} ${session.therapist.last_name}`}
                                  </h3>
                                  <div className="flex items-center text-sm text-slate-500 mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {date} at {time}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{session.duration_minutes} minutes</p>
                                  
                                  {hasMeetingLink && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
                                <Badge className={getSessionStatusColor(session.status)}>
                                  {session.status}
                                </Badge>
                                
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

            {/* Session History */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Session History ({filteredCompletedSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCompletedSessions.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No completed sessions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredCompletedSessions.slice(0, 10).map((session) => {
                      const { date, time } = formatSessionDateTime(session.session_date, session.start_time);
                      const rating = getSessionRating(session.id);
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={session.therapist.avatar_url} />
                              <AvatarFallback>
                                {session.therapist.name?.charAt(0) || session.therapist.first_name?.charAt(0) || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {session.therapist.name || `${session.therapist.first_name} ${session.therapist.last_name}`}
                              </h3>
                              <p className="text-sm text-slate-500">{date} at {time}</p>
                              <p className="text-xs text-slate-500">{session.duration_minutes} minutes</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={getSessionStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            {rating ? (
                              <div className="flex items-center text-sm">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                                {rating.rating}/5
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedSessionForRating(session.id)}
                              >
                                Rate Session
                              </Button>
                            )}
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

      case 'ratings':
        return (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-700">Your Session Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionRatings.length === 0 ? (
                <p className="text-center text-slate-600 py-8">No ratings submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {sessionRatings.map((rating) => {
                    const session = filteredCompletedSessions.find(s => s.id === rating.session_id);
                    return (
                      <div key={rating.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            {session ? (
                              session.therapist.name || `${session.therapist.first_name} ${session.therapist.last_name}`
                            ) : 'Unknown Therapist'}
                          </h3>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          Submitted on {format(new Date(rating.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'profile':
        return <UserProfileEditor />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {showTherapistHeader ? <TherapistHeader /> : <Header />}
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </main>

      {selectedSessionForRating && (
        <SessionRatingModal
          sessionId={selectedSessionForRating}
          onSubmit={async (rating, feedbackText, categories, wouldRecommend) => {
            await submitRating(selectedSessionForRating, rating, feedbackText, categories, wouldRecommend);
            setSelectedSessionForRating(null);
          }}
          onClose={() => setSelectedSessionForRating(null)}
        />
      )}
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
      {selectedTherapistForBooking && (
        <BookingModal
          therapist={selectedTherapistForBooking}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedTherapistForBooking(null);
          }}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default UserDashboard;