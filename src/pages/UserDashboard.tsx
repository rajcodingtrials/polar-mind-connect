import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClientSessions } from "@/hooks/useClientSessions";
import { useUserProfile } from "@/hooks/useUserProfile";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Star, User, FileText, Settings } from "lucide-react";
import { format } from "date-fns";
import SessionRatingModal from "@/components/SessionRatingModal";
import UserProfileEditor from "@/components/UserProfileEditor";

const UserDashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { upcomingSessions, completedSessions, sessionRatings, loading, submitRating } = useClientSessions(user?.id || null);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<string | null>(null);

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
        return 'bg-success text-success-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="flex-grow p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-700 mb-2">
              Welcome back, {profile?.name || profile?.username || 'User'}!
            </h1>
            <p className="text-slate-600">Manage your therapy sessions and profile here.</p>
          </div>

          <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200">
            <TabsTrigger value="sessions" className="data-[state=active]:bg-white data-[state=active]:text-slate-700">
              <Calendar className="w-4 h-4 mr-2" />
              My Sessions
            </TabsTrigger>
            <TabsTrigger value="ratings" className="data-[state=active]:bg-white data-[state=active]:text-slate-700">
              <Star className="w-4 h-4 mr-2" />
              Ratings & Feedback
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-slate-700">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
            </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            {/* Upcoming Sessions */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
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
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
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
                                <Star className="w-4 h-4 fill-warning text-warning mr-1" />
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
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
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
          </TabsContent>

          <TabsContent value="profile">
            <UserProfileEditor />
          </TabsContent>
        </Tabs>
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
    </div>
  );
};

export default UserDashboard;