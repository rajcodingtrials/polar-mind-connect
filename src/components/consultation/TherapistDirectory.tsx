import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, DollarSign, Star, X, Users } from "lucide-react";
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
      {/* Redesigned Filters Section */}
      <Card className="bg-gradient-to-r from-surface-elevated/95 to-surface-elevated/85 backdrop-blur-xl border-border/30 shadow-xl">
        <CardContent className="p-8 lg:p-12">
          <div className="space-y-10">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-emphasis-high">Find Your Perfect Therapist</h2>
              </div>
              <p className="text-lg text-emphasis-medium max-w-2xl mx-auto leading-relaxed">
                Discover qualified speech therapists tailored to your specific needs and communication goals.
              </p>
              
              {/* Results Counter & Active Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-emphasis-high">{filteredTherapists.length} therapists available</span>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {[searchQuery && 'Search', selectedSpecialization !== 'all' && 'Specialty', priceRange !== 'all' && 'Price'].filter(Boolean).length} active filters
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Prominent Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-emphasis-medium group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder="Search by therapist name, specialty, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 pr-6 h-16 text-lg bg-card/90 backdrop-blur-sm border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl font-medium"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Categories with Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Specialization Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emphasis-medium">
                  <Filter className="h-4 w-4" />
                  <span>Specialization</span>
                </div>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="h-12 bg-card/90 backdrop-blur-sm border-border/40 focus:border-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-lg border-border/30 rounded-xl shadow-xl">
                    <SelectItem value="all" className="focus:bg-surface-elevated rounded-lg">All Specializations</SelectItem>
                    {getUniqueSpecializations().map(spec => (
                      <SelectItem key={spec} value={spec} className="focus:bg-surface-elevated rounded-lg">{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emphasis-medium">
                  <DollarSign className="h-4 w-4" />
                  <span>Price Range</span>
                </div>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12 bg-card/90 backdrop-blur-sm border-border/40 focus:border-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <SelectValue placeholder="All Price Ranges" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-lg border-border/30 rounded-xl shadow-xl">
                    <SelectItem value="all" className="focus:bg-surface-elevated rounded-lg">All Prices</SelectItem>
                    <SelectItem value="0-50" className="focus:bg-surface-elevated rounded-lg">$0 - $50/session</SelectItem>
                    <SelectItem value="50-100" className="focus:bg-surface-elevated rounded-lg">$50 - $100/session</SelectItem>
                    <SelectItem value="100-150" className="focus:bg-surface-elevated rounded-lg">$100 - $150/session</SelectItem>
                    <SelectItem value="150" className="focus:bg-surface-elevated rounded-lg">$150+/session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emphasis-medium">
                  <Star className="h-4 w-4" />
                  <span>Sort By</span>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 bg-card/90 backdrop-blur-sm border-border/40 focus:border-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-lg border-border/30 rounded-xl shadow-xl">
                    <SelectItem value="name" className="focus:bg-surface-elevated rounded-lg">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low" className="focus:bg-surface-elevated rounded-lg">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="focus:bg-surface-elevated rounded-lg">Price: High to Low</SelectItem>
                    <SelectItem value="experience" className="focus:bg-surface-elevated rounded-lg">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-3 justify-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                <span className="text-sm font-medium text-emphasis-medium">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1 gap-2">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedSpecialization !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1 gap-2">
                    {selectedSpecialization}
                    <button onClick={() => setSelectedSpecialization('all')} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {priceRange !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1 gap-2">
                    ${priceRange}/session
                    <button onClick={() => setPriceRange('all')} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simplified Results Section */}
      <div className="space-y-8">
        {filteredTherapists.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-emphasis-medium">
              Showing {filteredTherapists.length} qualified speech therapist{filteredTherapists.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="space-y-10">
          {filteredTherapists.map((therapist, index) => (
            <div key={therapist.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <TherapistCard
                therapist={therapist}
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