import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

const TherapistPendingApproval = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-lg text-center">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="p-4 bg-amber-100 rounded-full">
                <Clock className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Application Under Review</CardTitle>
            <CardDescription className="text-base">
              Thank you for applying to join Polariz as a therapist!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            <p className="text-muted-foreground">
              Our team is currently reviewing your application. This process typically takes 1-3 business days.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-3">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 space-y-2 ml-7">
                <li>• We'll review your credentials and experience</li>
                <li>• You'll receive an email once your application is approved</li>
                <li>• After approval, you can log in and set up your profile</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Check your email for updates</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-4">
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default TherapistPendingApproval;
