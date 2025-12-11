import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Header from "../components/Header";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check URL parameters on component mount
  useEffect(() => {
    const signupParam = searchParams.get('signup');
    const forgotParam = searchParams.get('forgot');
    
    if (signupParam === 'true') {
      setIsLogin(false);
      setShowForgotPassword(false);
    } else if (forgotParam === 'true') {
      setShowForgotPassword(true);
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Password Reset Email Sent",
            description: "Please check your email for reset instructions.",
          });
          setShowForgotPassword(false);
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message,
          });
        } else {
          navigate("/");
        }
      } else {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1) {
          toast({
            variant: "destructive",
            title: "Invalid Age",
            description: "Please enter a valid age.",
          });
          return;
        }

        const { error } = await signUp(email, password, firstName, lastName, ageNum);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
          setIsLogin(true);
        }
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setAge("");
    setShowForgotPassword(false);
  };

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    resetForm();
    setIsLogin(newMode === 'login');
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
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center font-bold">
                  {showForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-center text-sm sm:text-base px-2">
                  {showForgotPassword 
                    ? "Enter your email to receive reset instructions"
                    : isLogin 
                      ? "Enter your credentials to access your account" 
                      : "Fill in your details to create a new account"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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

                  {!showForgotPassword && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 sm:h-11 text-base"
                        required
                      />
                    </div>
                  )}

                  {!isLogin && !showForgotPassword && (
                    <>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
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
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-10 sm:h-11 text-base"
                          required
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="age" className="text-sm sm:text-base">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="Enter your age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          min="1"
                          max="120"
                          className="h-10 sm:h-11 text-base"
                          required
                        />
                      </div>
                    </>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold mt-4 sm:mt-6" 
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : showForgotPassword ? "Send Reset Email" : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 px-4 sm:px-6 pb-6">
                {!showForgotPassword && (
                  <>
                    {isLogin && (
                      <Button
                        variant="link"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs sm:text-sm h-auto py-1"
                      >
                        Forgot your password?
                      </Button>
                    )}
                    <div className="text-xs sm:text-sm text-center">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <Button
                        variant="link"
                        onClick={() => handleModeSwitch(isLogin ? 'signup' : 'login')}
                        className="p-0 h-auto text-xs sm:text-sm font-semibold"
                      >
                        {isLogin ? "Sign up here" : "Sign in here"}
                      </Button>
                    </div>
                  </>
                )}
                
                {showForgotPassword && (
                  <Button
                    variant="link"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-xs sm:text-sm h-auto py-1"
                  >
                    Back to sign in
                  </Button>
                )}
                
                <Link 
                  to="/" 
                  className="text-xs sm:text-sm text-center text-gray-600 hover:text-gray-900 mt-2"
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

export default Auth;
