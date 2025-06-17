
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface TherapistCardProps {
  therapist: {
    id: string;
    name: string;
    image: string;
    lastInteraction: string;
    projectId?: string;
  };
  onClick?: (projectId: string, name: string) => void;
}

const TherapistCard = ({ therapist, onClick }: TherapistCardProps) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleClick = () => {
    if (onClick && therapist.projectId) {
      onClick(therapist.projectId, therapist.name);
    }
  };

  return (
    <Card
      className="mx-2 p-4 h-full cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-primary/20 hover:bg-accent/10 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="flex">
        {/* Left Column - 25% */}
        <div className="w-1/4 flex justify-center items-center">
          <Avatar className="h-16 w-16 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/30">
            <AvatarImage src={`/lovable-uploads/${therapist.image}`} alt={therapist.name} />
            <AvatarFallback>{getInitials(therapist.name)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Right Column - 75% */}
        <div className="w-3/4 flex flex-col justify-center pl-4">
          <CardTitle className="text-base mb-1 text-left transition-colors duration-300 hover:text-primary">
            {therapist.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-4 text-left">
            {therapist.lastInteraction}
          </CardDescription>
        </div>
      </div>
    </Card>
  );
};

export default TherapistCard;
