import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import TherapistProfileModal from "./TherapistProfileModal";
import TherapistCard from "./TherapistCard";
import TherapistSkeleton from "./TherapistSkeleton";
import EmptyState from "./EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useTherapistRatings } from "@/hooks/useTherapistRatings";

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
  headline: string;
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
  
  // Get therapist IDs for fetching ratings
  const therapistIds = therapists.map(t => t.id);
  const { ratings, loading: ratingsLoading, getRatingForTherapist } = useTherapistRatings(therapistIds);

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

  const hasActiveFilters = searchQuery || selectedSpecialization !== "all" || priceRange !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSpecialization("all");
    setPriceRange("all");
    setSortBy("name");
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <TherapistSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filters Section */}
      <Card className="bg-gradient-to-br from-background via-surface-elevated/60 to-surface-elevated/40 backdrop-blur-xl border-border/20 shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardContent className="p-6 lg:p-8">
          <div className="space-y-6">
            <div className="space-y-3 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emphasis-high via-primary to-emphasis-high bg-clip-text text-transparent">
                Find Your Perfect Therapist
              </h2>
              <p className="text-sm lg:text-base text-emphasis-medium leading-relaxed max-w-3xl">
                Use the filters below to find therapists that match your needs and preferences. Discover qualified professionals ready to help you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="relative group lg:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emphasis-medium group-focus-within:text-primary transition-all duration-300" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg focus:shadow-lg"
                />
              </div>
              
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg border-border/40 focus:border-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 rounded-xl shadow-2xl">
                  <SelectItem value="all" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">All Specializations</SelectItem>
                  {getUniqueSpecializations().map(spec => (
                    <SelectItem key={spec} value={spec} className="focus:bg-surface-elevated/80 rounded-lg transition-colors">{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg border-border/40 focus:border-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <SelectValue placeholder="All Price Ranges" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 rounded-xl shadow-2xl">
                  <SelectItem value="all" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">All Prices</SelectItem>
                  <SelectItem value="0-50" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">$0 - $50/session</SelectItem>
                  <SelectItem value="50-100" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">$50 - $100/session</SelectItem>
                  <SelectItem value="100-150" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">$100 - $150/session</SelectItem>
                  <SelectItem value="150" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">$150+/session</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg border-border/40 focus:border-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 md:col-start-2 lg:col-start-auto">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 rounded-xl shadow-2xl">
                  <SelectItem value="name" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">Price: High to Low</SelectItem>
                  <SelectItem value="experience" className="focus:bg-surface-elevated/80 rounded-lg transition-colors">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Section */}
      <div className="space-y-8">
        {filteredTherapists.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-surface-elevated/70 to-surface-elevated/50 backdrop-blur-sm rounded-2xl border border-border/20 shadow-sm">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-emphasis-high">
                {filteredTherapists.length} Therapist{filteredTherapists.length !== 1 ? 's' : ''} Found
              </p>
              <p className="text-sm text-emphasis-medium">
                Discover qualified professionals ready to help you achieve your communication goals
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-all duration-200 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 hover:border-primary/30"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        <div className="space-y-10">
          {filteredTherapists.map((therapist, index) => (
            <div key={therapist.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <TherapistCard
                therapist={therapist}
                rating={getRatingForTherapist(therapist.id)}
                onViewProfile={(t) => setSelectedTherapist(t)}
              />
            </div>
          ))}
        </div>
      </div>

      {filteredTherapists.length === 0 && !loading && (
        <EmptyState 
          hasFilters={Boolean(hasActiveFilters)}
          onClearFilters={clearAllFilters}
        />
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