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
          title: "Account Created",
          description: "Please check your email to verify your account. Once verified, your account will be reviewed by our team before you can access your dashboard.",
        });
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
    <div className="min-h-screen flex flex-col gradient-bg stars-bg">
      <Header />
      <main className="flex-grow w-full overflow-x-hidden">
        <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
          
          {/* Left: Auth Form */}
          <section className="w-full lg:w-[40%] xl:w-[35%] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8 sm:py-10 md:py-12 lg:py-0">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="space-y-2 px-4 sm:px-6 pt-6 pb-4">
                <div className="flex items-center justify-center mb-2 sm:mb-4">
                  <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center font-bold">
                  Therapist Sign Up
                </CardTitle>
                <CardDescription className="text-center text-sm sm:text-base px-2">
                  Create your professional therapist account
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4">
                <form onSubmit={handleAuthSubmit} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm sm:text-base">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-10 sm:h-11 text-base"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold mt-4 sm:mt-6" 
                    disabled={loading}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 px-4 sm:px-6 pb-6">
                <Link 
                  to="/" 
                  className="text-xs sm:text-sm text-center text-gray-600 hover:text-gray-900"
                >
                  ← Back to Home
                </Link>
              </CardFooter>
            </Card>
          </section>

          {/* Right: Image with overlayed text - Hidden on mobile, shown on tablet and up */}
          <section className="hidden md:block relative w-full lg:w-[60%] xl:w-[65%] flex-grow flex items-center justify-center bg-black">
            <img
              src="/lovable-uploads/FrontPage1.jpg"
              alt="Young girl with colorful alphabet letters emerging from her speech, representing AI-powered speech therapy for children"
              className="w-full h-full object-cover object-center absolute inset-0 z-0"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/20 z-10" aria-hidden="true"></div>
            <div className="relative z-20 w-full flex flex-col items-center lg:items-end justify-center px-6 md:px-8 lg:px-12 xl:px-16 py-12 md:py-16 lg:py-20 text-center lg:text-right">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-wide mb-6 md:mb-8 lg:mb-12 whitespace-pre-line">
                Shaping future one<br />word at a time
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-white leading-relaxed tracking-wide max-w-lg whitespace-pre-line">
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
