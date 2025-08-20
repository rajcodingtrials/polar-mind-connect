import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Clock, DollarSign } from "lucide-react";
import TherapistProfileModal from "./TherapistProfileModal";
import { useToast } from "@/hooks/use-toast";
import { getCountryFlag } from "@/utils/countryFlags";

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  bio: string;
  specializations: string[];
  languages: string[];
  years_experience: number;
  hourly_rate_30min: number;
  hourly_rate_60min: number;
  avatar_url: string;
  is_verified: boolean;
  timezone: string;
  education: string;
  certification: string;
  country: string;
}

const TherapistDirectory = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    filterAndSortTherapists();
  }, [therapists, searchQuery, selectedSpecialization, priceRange, sortBy]);

  const fetchTherapists = async () => {
    try {
      console.log("Fetching therapists...");
      const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("is_active", true);
        // Removed .eq("is_verified", true) to show all active therapists

      console.log("Therapists data:", data);
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      setTherapists(data || []);
    } catch (error) {
      console.error("Error fetching therapists:", error);
      toast({
        title: "Error",
        description: "Failed to load therapists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTherapists = () => {
    let filtered = [...therapists];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(therapist => 
        `${therapist.first_name} ${therapist.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specializations?.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
        therapist.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Specialization filter
    if (selectedSpecialization && selectedSpecialization !== "all") {
      filtered = filtered.filter(therapist => 
        therapist.specializations?.includes(selectedSpecialization)
      );
    }

    // Price range filter
    if (priceRange && priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(therapist => {
        const rate = therapist.hourly_rate_30min || 0;
        return rate >= min && (max ? rate <= max : true);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.hourly_rate_30min || 0) - (b.hourly_rate_30min || 0);
        case "price-high":
          return (b.hourly_rate_30min || 0) - (a.hourly_rate_30min || 0);
        case "experience":
          return (b.years_experience || 0) - (a.years_experience || 0);
        case "name":
        default:
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      }
    });

    setFilteredTherapists(filtered);
  };

  const getUniqueSpecializations = () => {
    const allSpecs = therapists.flatMap(t => t.specializations || []);
    return [...new Set(allSpecs)];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search therapists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {getUniqueSpecializations().map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-50">$0 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100-150">$100 - $150</SelectItem>
                <SelectItem value="150">$150+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTherapists.map((therapist) => (
          <Card key={therapist.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Left Column */}
                <div className="flex flex-col items-center space-y-4 min-w-[200px]">
                  {/* Avatar */}
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={therapist.avatar_url} 
                      alt={`${therapist.first_name} ${therapist.last_name}`}
                    />
                    <AvatarFallback className="text-lg">
                      {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Country Flag */}
                  {therapist.country && (
                    <div className="flex items-center text-sm">
                      <span className="text-xl mr-2">{getCountryFlag(therapist.country)}</span>
                      <span className="text-muted-foreground">Language</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Sessions Count */}
                  <div className="text-center">
                    <div className="text-sm font-medium">{Math.floor(Math.random() * 500) + 100} Sessions</div>
                  </div>

                  {/* Book Trial Button */}
                  <Button 
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => setSelectedTherapist(therapist)}
                    size="sm"
                  >
                    Book Trial
                  </Button>
                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-4">
                  {/* Name */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {therapist.first_name} {therapist.last_name}
                    </h3>
                    {therapist.country && (
                      <p className="text-sm text-muted-foreground">
                        Native Speech Therapist from the {therapist.country}
                      </p>
                    )}
                  </div>

                  {/* Specializations */}
                  {therapist.specializations && therapist.specializations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">SPEAKS:</p>
                      <div className="flex flex-wrap gap-2">
                        {therapist.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rates */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">HOURLY RATE FROM:</p>
                    <div className="space-y-1">
                      {therapist.hourly_rate_30min && (
                        <p className="text-sm">USD ${therapist.hourly_rate_30min} (30 min)</p>
                      )}
                      {therapist.hourly_rate_60min && (
                        <p className="text-sm">USD ${therapist.hourly_rate_60min} (60 min)</p>
                      )}
                    </div>
                  </div>

                  {/* Trial Info */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">TRIAL:</p>
                    <p className="text-sm">USD {Math.floor((therapist.hourly_rate_30min || 50) * 0.5)}.50</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {therapist.bio || "Experienced speech therapist dedicated to helping clients achieve their communication goals through personalized therapy sessions."}
                    </p>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{therapist.years_experience || 0}+ years experience</span>
                    {therapist.is_verified && (
                      <Badge variant="default" className="ml-4 bg-green-100 text-green-800 border-green-200">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTherapists.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No therapists found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedTherapist && (
        <TherapistProfileModal
          therapist={selectedTherapist}
          isOpen={!!selectedTherapist}
          onClose={() => setSelectedTherapist(null)}
        />
      )}
    </div>
  );
};

export default TherapistDirectory;