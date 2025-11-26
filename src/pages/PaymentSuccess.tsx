import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Calendar, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchSession = async () => {
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

    fetchSession();
  }, [sessionId, navigate]);

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
            <Button onClick={() => navigate("/find-coaches")} variant="outline" className="flex-1">
              Find More Coaches
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
