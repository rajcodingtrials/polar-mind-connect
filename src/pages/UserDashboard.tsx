import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClientSessions } from "@/hooks/useClientSessions";
import { useUserProfile } from "@/hooks/useUserProfile";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  Star, 
  FileText, 
  BookOpen,
  TrendingUp,
  Timer,
  Flame,
  Award,
  Video,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import SessionRatingModal from "@/components/parents/SessionRatingModal";
import UserProfileEditor from "@/components/parents/UserProfileEditor";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";

const UserDashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { upcomingSessions, completedSessions, sessionRatings, loading, submitRating } = useClientSessions(user?.id || null);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'ratings' | 'profile'>('dashboard');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'sessions', 'ratings', 'profile'].includes(tab)) {
      setActiveTab(tab as 'dashboard' | 'sessions' | 'ratings' | 'profile');
    }
  }, [location.search]);

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

  // Calculate stats
  const totalCompletedSessions = completedSessions.length;
  const totalTimeMinutes = completedSessions.reduce((acc, session) => acc + (session.duration_minutes || 0), 0);
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

            {/* Badges Section */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Sample badges - replace with actual badge data */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-yellow-100">
                          <Award className="h-8 w-8 text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-amber-700">First Session</p>
                          <p className="text-2xl font-bold text-amber-900">✓</p>
                          <p className="text-xs text-amber-600">Badge earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Flame className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-700">5 Day Streak</p>
                          <p className="text-2xl font-bold text-blue-900">✓</p>
                          <p className="text-xs text-blue-600">Badge earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-green-100">
                          <BookOpen className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-700">10 Sessions</p>
                          <p className="text-2xl font-bold text-green-900">✓</p>
                          <p className="text-xs text-green-600">Badge earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border border-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Star className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-700">High Rating</p>
                          <p className="text-2xl font-bold text-purple-900">✓</p>
                          <p className="text-xs text-purple-600">Badge earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  Upcoming Sessions ({upcomingSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No upcoming sessions scheduled.</p>
                    <Button onClick={() => window.location.href = '/consultation'}>
                      Book a Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => {
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
                  Session History ({completedSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedSessions.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No completed sessions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {completedSessions.slice(0, 10).map((session) => {
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
                    const session = completedSessions.find(s => s.id === rating.session_id);
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
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
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
      
      <Footer />
    </div>
  );
};

export default UserDashboard;