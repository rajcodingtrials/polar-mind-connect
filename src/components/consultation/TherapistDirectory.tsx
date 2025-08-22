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
      {/* Filters Section */}
      <Card className="bg-surface-elevated/80 backdrop-blur-sm border-border/50 shadow-sm">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-emphasis-high">Find Your Perfect Therapist</h2>
              <p className="text-sm text-emphasis-medium">
                Use the filters below to find therapists that match your needs and preferences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-emphasis-medium" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>
              
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="bg-card border-border/50 focus:border-primary">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all" className="focus:bg-surface-elevated">All Specializations</SelectItem>
                  {getUniqueSpecializations().map(spec => (
                    <SelectItem key={spec} value={spec} className="focus:bg-surface-elevated">{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-card border-border/50 focus:border-primary">
                  <SelectValue placeholder="All Price Ranges" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all" className="focus:bg-surface-elevated">All Prices</SelectItem>
                  <SelectItem value="0-50" className="focus:bg-surface-elevated">$0 - $50/session</SelectItem>
                  <SelectItem value="50-100" className="focus:bg-surface-elevated">$50 - $100/session</SelectItem>
                  <SelectItem value="100-150" className="focus:bg-surface-elevated">$100 - $150/session</SelectItem>
                  <SelectItem value="150" className="focus:bg-surface-elevated">$150+/session</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-card border-border/50 focus:border-primary">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="name" className="focus:bg-surface-elevated">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low" className="focus:bg-surface-elevated">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="focus:bg-surface-elevated">Price: High to Low</SelectItem>
                  <SelectItem value="experience" className="focus:bg-surface-elevated">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        {filteredTherapists.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-surface-elevated/50 rounded-lg border border-border/30">
            <p className="text-sm text-emphasis-medium font-medium">
              Showing <span className="text-emphasis-high font-bold">{filteredTherapists.length}</span> therapist{filteredTherapists.length !== 1 ? 's' : ''}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        <div className="space-y-8">
          {filteredTherapists.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              therapist={therapist}
              onViewProfile={(t) => setSelectedTherapist(t)}
            />
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