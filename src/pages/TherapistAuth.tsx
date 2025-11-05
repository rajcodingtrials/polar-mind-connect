import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useTherapistAuth } from "../hooks/useTherapistAuth";
import { useToast } from "@/components/ui/use-toast";
import { Stethoscope, UserPlus } from "lucide-react";

const TherapistAuth = () => {
  const [searchParams] = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  // Therapist profile fields
  const [therapistName, setTherapistName] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [certification, setCertification] = useState("");
  const [rate30min, setRate30min] = useState("");
  const [rate60min, setRate60min] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [education, setEducation] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { therapistProfile, createTherapistProfile, isTherapist } = useTherapistAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Available specializations (should match database)
  const availableSpecializations = [
    "Speech Therapy", "Language Development", "Articulation Therapy",
    "Fluency Disorders", "Voice Therapy", "Autism Spectrum Support",
    "Early Intervention", "Cognitive Communication", "Swallowing Therapy",
    "Accent Modification"
  ];

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

      const { error } = await signUp(email, password, firstName, lastName, age, true);
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account, then create your therapist profile.",
        });
        setShowCreateProfile(true);
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        date_of_birth: dateOfBirth,
        phone: phone || null,
        country: country || null,
        name: therapistName,
        bio,
        years_experience: parseInt(yearsExperience) || 0,
        certification,
        education: education || null,
        languages: languages.length > 0 ? languages : null,
        hourly_rate_30min: parseFloat(rate30min) || null,
        hourly_rate_60min: parseFloat(rate60min) || null,
        specializations,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const { error } = await createTherapistProfile(profileData);
      if (!error) {
        navigate("/therapist-dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create therapist profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setSpecializations(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  if (user && (showCreateProfile || isVerified)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">Create Therapist Profile</CardTitle>
            <CardDescription className="text-center">
              {isVerified && (
                <div className="text-green-600 font-medium mb-2">
                  ✓ Email verified! Complete your therapist profile below.
                </div>
              )}
              Complete your professional profile to start accepting clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="therapistName">Professional Name</Label>
                  <Input
                    id="therapistName"
                    placeholder="Dr. Jane Smith"
                    value={therapistName}
                    onChange={(e) => setTherapistName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    placeholder="5"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about your background, approach, and specialties..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification">Certifications & Licenses</Label>
                <Input
                  id="certification"
                  placeholder="CCC-SLP, M.S. in Speech-Language Pathology"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate30min">30-min Session Rate ($)</Label>
                  <Input
                    id="rate30min"
                    type="number"
                    placeholder="75"
                    value={rate30min}
                    onChange={(e) => setRate30min(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate60min">60-min Session Rate ($)</Label>
                  <Input
                    id="rate60min"
                    type="number"
                    placeholder="150"
                    value={rate60min}
                    onChange={(e) => setRate60min(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Specializations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSpecializations.map((spec) => (
                    <Badge
                      key={spec}
                      variant={specializations.includes(spec) ? "default" : "secondary"}
                      className="cursor-pointer justify-center"
                      onClick={() => toggleSpecialization(spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Profile..." : "Create Therapist Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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