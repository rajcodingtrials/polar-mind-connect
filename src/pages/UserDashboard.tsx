import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClientSessions } from "@/hooks/useClientSessions";
import { useUserProfile } from "@/hooks/useUserProfile";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Star, 
  User, 
  FileText, 
  BookOpen,
  TrendingUp,
  Timer,
  Flame,
  LayoutDashboard,
  Award
} from "lucide-react";
import { format } from "date-fns";
import SessionRatingModal from "@/components/SessionRatingModal";
import UserProfileEditor from "@/components/UserProfileEditor";

const UserDashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { upcomingSessions, completedSessions, sessionRatings, loading, submitRating } = useClientSessions(user?.id || null);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'ratings' | 'profile'>('dashboard');

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col gradient-bg stars-bg">
        <Header />
        <main className="flex-grow p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4 text-white">Loading...</h1>
              <p className="text-white/80">Please wait while we load your dashboard.</p>
            </div>
          </div>
        </main>
      </div>
    );
  };

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

  // Calculate stats
  const totalCompletedSessions = completedSessions.length;
  const totalTimeMinutes = completedSessions.reduce((acc, session) => acc + (session.duration_minutes || 0), 0);
  const totalTimeHours = Math.round(totalTimeMinutes / 60 * 10) / 10;
  const streakDays = 5; // This would be calculated based on consecutive days
  const averageRating = sessionRatings.length > 0 
    ? Math.round((sessionRatings.reduce((acc, rating) => acc + rating.rating, 0) / sessionRatings.length) * 10) / 10
    : 0;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sessions', label: 'My Sessions', icon: Calendar },
    { id: 'ratings', label: 'Ratings & Feedback', icon: Star },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Progress Rating</p>
                      <p className="text-3xl font-bold mt-2">{averageRating > 0 ? `${averageRating}/5` : 'N/A'}</p>
                      <p className="text-blue-100 text-xs mt-1">Average rating</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Lessons Completed</p>
                      <p className="text-3xl font-bold mt-2">{totalCompletedSessions}</p>
                      <p className="text-purple-100 text-xs mt-1">Total sessions</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Streak</p>
                      <p className="text-3xl font-bold mt-2">{streakDays} days</p>
                      <p className="text-orange-100 text-xs mt-1">Current streak</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Time</p>
                      <p className="text-3xl font-bold mt-2">{totalTimeHours}h</p>
                      <p className="text-green-100 text-xs mt-1">Hours completed</p>
                    </div>
                    <Timer className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badges Section */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Sample badges - replace with actual badge data */}
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg border border-yellow-200">
                    <Award className="w-8 h-8 text-amber-600 mb-2" />
                    <p className="text-xs font-medium text-amber-800">First Session</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                    <Flame className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-xs font-medium text-blue-800">5 Day Streak</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border border-green-200">
                    <BookOpen className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-xs font-medium text-green-800">10 Sessions</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg border border-purple-200">
                    <Star className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-xs font-medium text-purple-800">High Rating</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg border border-gray-200 opacity-50">
                    <Timer className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs font-medium text-gray-500">50 Hours</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg border border-gray-200 opacity-50">
                    <TrendingUp className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs font-medium text-gray-500">Progress Master</p>
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
                          <div className="text-right">
                            <Badge className={getSessionStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                        </div>
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
                        {rating.feedback_text && (
                          <p className="text-sm text-slate-600 mb-2">{rating.feedback_text}</p>
                        )}
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
    <div className="min-h-screen flex flex-col gradient-bg stars-bg">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-md border-r border-white/20 shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Dashboard</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome {profile?.name || profile?.username || 'User'}
              </h1>
              <p className="text-white/80">All systems are running smoothly! You have {upcomingSessions.length} upcoming sessions.</p>
              <p className="text-sm text-white/60 mt-1">Today ({format(new Date(), 'dd MMM yyyy')})</p>
            </div>

            {/* Dynamic Content */}
            {renderContent()}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default UserDashboard;