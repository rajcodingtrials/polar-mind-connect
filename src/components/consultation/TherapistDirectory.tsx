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
      const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("is_active", true)
        .eq("is_verified", true);

      if (error) throw error;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.map((therapist) => (
          <Card key={therapist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={therapist.avatar_url} />
                  <AvatarFallback>
                    {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {therapist.first_name} {therapist.last_name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {therapist.years_experience || 0} years experience
                  </div>
                </div>
                {therapist.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {therapist.bio}
              </p>

              <div className="space-y-3">
                {therapist.specializations && therapist.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {therapist.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {therapist.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{therapist.specializations.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {therapist.hourly_rate_30min ? `$${therapist.hourly_rate_30min}/30min` : "Rate TBD"}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedTherapist(therapist)}
                  >
                    View Profile
                  </Button>
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