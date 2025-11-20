import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import TherapistDirectory from "@/components/consultation/TherapistDirectory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Star, CheckCircle, Users, Clock, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const FindCoaches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      setTherapists(data || []);
    } catch (error) {
      console.error("Error fetching therapists:", error);
    }
  };

  const getUniqueSpecializations = () => {
    const allSpecs = therapists.flatMap((t: any) => t.specializations || []);
    return [...new Set(allSpecs)];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to browse and book therapist consultations.
              </p>
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Merged Section */}
      <div className="container mx-auto px-4 py-10 lg:py-16">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                  Find Your Perfect Speech Therapist
                </h1>
              </div>

              {/* Description Text */}
              <p className="text-lg sm:text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed font-medium text-center">
                Connect with verified, licensed speech therapists for personalized therapy sessions. 
                Start your journey to better communication today.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Verified Therapists</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{therapists.length}+ Professionals</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-slate-700">4.9 Average Rating</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors duration-200">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">24/7 Support</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-4">
                <div className="relative group lg:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-all duration-300" />
                  <Input
                    placeholder="Search by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md focus:shadow-md"
                  />
                </div>
                
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="h-12 bg-white border-slate-200 focus:border-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg">
                    <SelectItem value="all">All Specializations</SelectItem>
                    {getUniqueSpecializations().map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12 bg-white border-slate-200 focus:border-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <SelectValue placeholder="All Price Ranges" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-50">$0 - $50/session</SelectItem>
                    <SelectItem value="50-100">$50 - $100/session</SelectItem>
                    <SelectItem value="100-150">$100 - $150/session</SelectItem>
                    <SelectItem value="150">$150+/session</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 bg-white border-slate-200 focus:border-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 md:col-start-2 lg:col-start-auto">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg">
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Directory Section */}
      <div id="therapist-directory" className="container mx-auto px-4 py-8">
        <TherapistDirectory 
          searchQuery={searchQuery}
          selectedSpecialization={selectedSpecialization}
          priceRange={priceRange}
          sortBy={sortBy}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default FindCoaches;

