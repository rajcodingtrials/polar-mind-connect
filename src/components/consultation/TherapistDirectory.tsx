import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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

interface TherapistDirectoryProps {
  searchQuery?: string;
  selectedSpecialization?: string;
  priceRange?: string;
  sortBy?: string;
}

const TherapistDirectory = ({ 
  searchQuery = "", 
  selectedSpecialization = "all", 
  priceRange = "all", 
  sortBy = "name" 
}: TherapistDirectoryProps) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
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
    // Filters are controlled by parent component
    window.location.reload();
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
      {/* Enhanced Results Section */}
      <div className="space-y-8">
        {filteredTherapists.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-7xl mx-auto">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-700">
                {filteredTherapists.length} Therapist{filteredTherapists.length !== 1 ? 's' : ''} Found
              </p>
              <p className="text-sm text-slate-600">
                Discover qualified professionals ready to help you achieve your communication goals
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-300"
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