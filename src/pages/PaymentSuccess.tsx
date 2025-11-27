import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Calendar, Clock, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");
  const lessonId = searchParams.get("lesson_id");

  useEffect(() => {
    const fetchData = async () => {
      // Handle lesson purchase
      if (lessonId) {
        const { data, error } = await supabase
          .from("lessons_v2")
          .select("id, name, description, price")
          .eq("id", lessonId)
          .single();

        if (error) {
          console.error("Error fetching lesson:", error);
          navigate("/");
          return;
        }

        setLesson(data);
        
        // Add lesson to parent's profile
        if (user?.id) {
          try {
            const { data: parentData } = await supabase
              .from('parents' as any)
              .select('lessons')
              .eq('user_id', user.id)
              .maybeSingle();

            let existingLessons: string[] = [];
            if (parentData && 'lessons' in parentData && parentData.lessons && typeof parentData.lessons === 'string' && parentData.lessons.trim() !== '') {
              existingLessons = parentData.lessons.split(',').map(id => id.trim()).filter(id => id);
            }

            if (!existingLessons.includes(lessonId)) {
              const updatedLessons = [...existingLessons, lessonId].join(',');
              await supabase
                .from('parents' as any)
                .upsert({ 
                  user_id: user.id, 
                  lessons: updatedLessons 
                }, {
                  onConflict: 'user_id'
                });
            }
          } catch (error) {
            console.error("Error adding lesson to profile:", error);
          }
        }
        
        setLoading(false);
        return;
      }

      // Handle session booking
      if (!sessionId) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("therapy_sessions")
        .select(`
          *,
          therapists (
            name,
            first_name,
            last_name
          )
        `)
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        navigate("/");
        return;
      }

      setSession(data);
      setLoading(false);
    };

    fetchData();
  }, [sessionId, lessonId, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const therapistName = session?.therapists?.first_name 
    ? `${session.therapists.first_name} ${session.therapists.last_name || ''}`
    : session?.therapists?.name || "Your Therapist";

  // Render lesson purchase success
  if (lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <p className="text-muted-foreground">
              Your lesson purchase has been confirmed.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Lesson Details</h3>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Lesson Name</p>
                    <p className="text-sm text-muted-foreground">
                      {lesson.name}
                    </p>
                  </div>
                </div>

                {lesson.description && (
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">
                      ${lesson.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                The lesson has been added to your profile and is now available in your learning adventure.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate("/home")} className="flex-1">
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate("/lessons-marketplace")} variant="outline" className="flex-1">
                Browse More Lessons
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render session booking success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Your therapy session has been confirmed and booked.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Session Details</h3>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.session_date), "EEEE, MMMM d, yyyy")} at {session.start_time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {session.duration_minutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Therapist</p>
                  <p className="text-sm text-muted-foreground">
                    {therapistName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with the meeting link and details.
              You will also receive a reminder 24 hours before your session.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/home")} className="flex-1">
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate("/consultation")} variant="outline" className="flex-1">
              Find More Coaches
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
