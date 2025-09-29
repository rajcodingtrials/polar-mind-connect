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
    <Card className="w-full max-w-md shadow-lg mt-0">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-2xl text-center">Login</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-0">
        <Link 
          to="/auth?forgot=true" 
          className="text-sm text-center text-blue-600 hover:text-blue-800 underline"
        >
          Forgot your password?
        </Link>
        <div className="text-sm text-center text-gray-600">
          Sign up as:{" "}
          <Link 
            to="/auth?signup=true" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Parent
          </Link>
          {" or "}
          <Link 
            to="/therapist-auth?signup=true" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Therapist
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
