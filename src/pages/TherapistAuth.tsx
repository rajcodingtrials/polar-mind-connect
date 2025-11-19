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
          description: "Please check your email to verify your account. Once verified, you'll be redirected to your therapist dashboard.",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
          <Link to="/auth" className="text-sm text-center text-blue-600 hover:text-blue-900">
            Client Login →
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TherapistAuth;
