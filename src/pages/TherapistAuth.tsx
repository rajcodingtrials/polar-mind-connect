import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useToast } from "@/components/ui/use-toast";
import { Stethoscope, UserPlus } from "lucide-react";
import Header from "../components/Header";

const TherapistAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  const [loading, setLoading] = useState(false);
  const { user, signUp } = useAuth();
  const { isTherapist } = useTherapistAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isTherapist()) {
      navigate("/therapist-dashboard");
    }
  }, [user, isTherapist, navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || isNaN(birthDate.getTime())) {
        toast({
          variant: "destructive",
          title: "Invalid Date of Birth",
          description: "Therapists must be at least 18 years old.",
        });
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, firstName, lastName, age, true, dateOfBirth);
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Application Submitted!",
          description: "Please check your email to verify your account. Our team will review your application and notify you once approved.",
        });
        navigate("/therapist-pending-approval");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col gradient-bg stars-bg">
      <Header />
      <main className="flex-grow h-full flex items-stretch justify-stretch min-h-0 w-full">
        <div className="flex flex-col md:flex-row w-full h-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex-grow">
          
          {/* Left: Auth Form (30%) */}
          <section className="w-full md:w-[30%] md:min-w-[420px] lg:w-[35%] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 min-h-[400px] md:min-h-0 overflow-y-auto">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-center">
                  Therapist Sign Up
                </CardTitle>
                <CardDescription className="text-center">
                  Create your professional therapist account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Link to="/" className="text-sm text-center text-gray-600 hover:text-gray-900">
                  ← Back to Home
                </Link>
              </CardFooter>
            </Card>
          </section>

          {/* Right: Image with overlayed text (70%) */}
          <section className="relative w-full md:w-[70%] lg:w-[65%] flex-grow flex items-center justify-center p-0 bg-black min-h-[300px] sm:min-h-[400px] md:min-h-0">
            <img
              src="/lovable-uploads/FrontPage1.jpg"
              alt="Young girl with colorful alphabet letters emerging from her speech, representing AI-powered speech therapy for children"
              className="w-full h-full object-cover object-center absolute inset-0 z-0"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/20 z-10" aria-hidden="true"></div>
            <div className="relative z-20 w-full flex flex-col items-center md:items-end justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 text-center md:text-right md:pr-12 lg:pr-24 xl:pr-32">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-wide mb-8 sm:mb-12 md:mb-20 whitespace-pre-line">
                Shaping future one<br />word at a time
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-white leading-loose tracking-wide max-w-lg whitespace-pre-line">
                AI speech therapists that turn home into<br />learning hubs and parents into expert teachers
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default TherapistAuth;
