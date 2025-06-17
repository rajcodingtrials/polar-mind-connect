
import React from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";
import TherapistCard from "./TherapistCard";

interface TherapistCarouselProps {
  user: any;
  userData: {
    [key: string]: {
      therapistNames: string;
      therapistImages: string;
      lastInteractions: string;
      therapistProjects: string;
    };
  };
  onTherapistSelect?: (projectId: string, name: string) => void;
  therapistsCount?: number;
}

const TherapistCarousel = ({ user, userData, onTherapistSelect, therapistsCount = 0 }: TherapistCarouselProps) => {
  // Safely access user data and provide fallbacks
  const username = user?.username || "";
  const userInfo = userData[username];
  
  // Create empty arrays as fallbacks
  const therapistNames = userInfo?.therapistNames.split(",") || [];
  const therapistImages = userInfo?.therapistImages.split(",") || [];
  const lastInteractions = userInfo?.lastInteractions.split(",") || [];
  const therapistProjects = userInfo?.therapistProjects.split(",") || [];

  // Map the data to create therapist objects
  const therapists = therapistNames.map((name, index) => ({
    id: `therapist-${index}`,
    name: name.trim(),
    image: therapistImages[index]?.trim() || "",
    lastInteraction: lastInteractions[index]?.trim() || "No recent interactions",
    projectId: therapistProjects[index]?.trim() || ""
  }));

  // If no therapists are available, show default ones
  const displayTherapists = therapists.length > 0 ? therapists : [
    {
      id: "default-1",
      name: "Dr. Sarah Johnson",
      image: "",
      lastInteraction: "Worked on pronunciation exercises",
      projectId: "default-project-id"
    },
    {
      id: "default-2",
      name: "Mark Williams",
      image: "",
      lastInteraction: "Practiced conversational skills",
      projectId: "default-project-id"
    },
    {
      id: "default-3",
      name: "Lisa Chen",
      image: "",
      lastInteraction: "Reviewed speech patterns",
      projectId: "default-project-id"
    }
  ];

  // Determine if navigation arrows should be shown (only if more than 3 therapists)
  const showArrows = displayTherapists.length > 3;

  return (
    <Carousel className="w-full max-w-3xl mx-auto">
      <CarouselContent>
        {displayTherapists.map((therapist) => (
          <CarouselItem key={therapist.id} className="md:basis-1/2 lg:basis-1/3">
            <TherapistCard
              therapist={therapist}
              onClick={onTherapistSelect}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {showArrows && (
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative static left-0 translate-y-0 mr-2" />
          <CarouselNext className="relative static right-0 translate-y-0 ml-2" />
        </div>
      )}
    </Carousel>
  );
};

export default TherapistCarousel;
