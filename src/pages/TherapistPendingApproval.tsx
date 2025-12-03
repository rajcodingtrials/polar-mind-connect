import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import { Clock, Mail, LogOut } from "lucide-react";

const TherapistPendingApproval = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Minimal header with just logo - no navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/polariz_icon_only_white.png" 
              alt="Polariz Logo" 
              className="h-8 w-8 bg-primary rounded-full p-1"
            />
            <span className="text-xl font-semibold text-foreground">Polariz</span>
          </Link>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
            <CardDescription className="text-base">
              Thank you for signing up as a therapist!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-800 text-sm">
                Your account is currently under review by our team. We'll verify your credentials and approve your account shortly.
              </p>
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>
                  You'll receive an email notification once your account has been approved and you can access your dashboard.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TherapistPendingApproval;
