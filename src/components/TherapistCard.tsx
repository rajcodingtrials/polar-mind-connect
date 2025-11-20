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

  // Get pastel color scheme based on therapist ID
  const getPastelColorScheme = (id: string) => {
    const colors = [
      { bg: 'bg-pink-100', hover: 'hover:bg-pink-200', border: 'border-pink-200', text: 'text-pink-800' },
      { bg: 'bg-lavender-100', hover: 'hover:bg-lavender-200', border: 'border-lavender-200', text: 'text-lavender-800' },
      { bg: 'bg-mint-100', hover: 'hover:bg-mint-200', border: 'border-mint-200', text: 'text-mint-800' },
      { bg: 'bg-peach-100', hover: 'hover:bg-peach-200', border: 'border-peach-200', text: 'text-peach-800' },
      { bg: 'bg-sky-100', hover: 'hover:bg-sky-200', border: 'border-sky-200', text: 'text-sky-800' },
      { bg: 'bg-rose-100', hover: 'hover:bg-rose-200', border: 'border-rose-200', text: 'text-rose-800' }
    ];
    
    // Use the ID to consistently assign colors
    const index = parseInt(id.replace(/\D/g, '')) || 0;
    return colors[index % colors.length];
  };

  const colorScheme = getPastelColorScheme(therapist.id);

  const handleClick = () => {
    if (onClick && therapist.projectId) {
      onClick(therapist.projectId, therapist.name);
    }
  };

  return (
    <Card
      className={`mx-2 p-4 h-full cursor-pointer transition-all duration-300 border-2 ${colorScheme.bg} ${colorScheme.hover} ${colorScheme.border} hover:shadow-md`}
      onClick={handleClick}
    >
      <div className="flex">
        {/* Left Column - 25% */}
        <div className="w-1/4 flex justify-center items-center">
          <Avatar
            className="
              h-16 w-16 
              transition-all duration-300 
              group-hover:ring-2 group-hover:ring-primary/30 
              bg-white 
              flex items-center justify-center
            "
          >
            <AvatarImage
              src={`/lovable-uploads/${therapist.image}`}
              alt={therapist.name}
              className="w-full h-full object-contain p-1"
            />
            <AvatarFallback className={`${colorScheme.bg} ${colorScheme.text}`}>
              {getInitials(therapist.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Right Column - 75% */}
        <div className="w-3/4 flex flex-col justify-center pl-4">
          <CardTitle className={`text-base mb-1 text-left transition-colors duration-300 ${colorScheme.text} hover:text-primary`}>
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
