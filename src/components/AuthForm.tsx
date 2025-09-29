import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (!result.error) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user is a therapist
          const { data: therapistData } = await supabase
            .from('therapists')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          // Redirect based on user type
          if (therapistData) {
            navigate("/therapist-dashboard", { replace: true });
          } else {
            navigate("/home", { replace: true });
          }
          window.scrollTo(0, 0);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error?.message || "Invalid credentials. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-elegant border-border/50">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <p className="text-sm text-center text-muted-foreground">
          Sign in to your account to continue
        </p>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-0 pb-6">
        <Link 
          to="/auth?forgot=true" 
          className="text-sm text-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Forgot your password?
        </Link>
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Don't have an account?
            </span>
          </div>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          Sign up as{" "}
          <Link 
            to="/auth?signup=true" 
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
          >
            Parent
          </Link>
          {" "}or{" "}
          <Link 
            to="/therapist-auth?signup=true" 
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
          >
            Therapist
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
