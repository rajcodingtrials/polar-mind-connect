
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

        const { error } = await signUp(email, password, username, name, ageNum);
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
    setUsername("");
    setName("");
    setAge("");
    setShowForgotPassword(false);
  };

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    resetForm();
    setIsLogin(newMode === 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {showForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {showForgotPassword 
              ? "Enter your email to receive reset instructions"
              : isLogin 
                ? "Enter your credentials to access your account" 
                : "Fill in your details to create a new account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {!showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {!isLogin && !showForgotPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : showForgotPassword ? "Send Reset Email" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!showForgotPassword && (
            <>
              {isLogin && (
                <Button
                  variant="link"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm"
                >
                  Forgot your password?
                </Button>
              )}
              <div className="text-sm text-center">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Button
                  variant="link"
                  onClick={() => handleModeSwitch(isLogin ? 'signup' : 'login')}
                  className="p-0 h-auto text-sm"
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
              className="text-sm"
            >
              Back to sign in
            </Button>
          )}
          
          <Link to="/" className="text-sm text-center text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
