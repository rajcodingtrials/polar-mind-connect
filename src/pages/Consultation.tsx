import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import TherapistDirectory from "@/components/consultation/TherapistDirectory";
import TherapistHero from "@/components/consultation/TherapistHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Consultation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg stars-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4 text-white">Sign In Required</h2>
              <p className="text-white/80 mb-4">
                Please sign in to browse and book therapist consultations.
              </p>
              <Button onClick={() => navigate("/auth")} className="bg-white text-black hover:bg-white/90">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg stars-bg">
      <Header />
      
      {/* Hero Section */}
      <TherapistHero therapistCount={150} />
      
      {/* Directory Section */}
      <div className="container mx-auto px-4 py-16">
        <TherapistDirectory />
      </div>
    </div>
  );
};

export default Consultation;