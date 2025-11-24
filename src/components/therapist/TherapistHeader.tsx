import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User as UserIcon, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

/**
 * TherapistHeader component displays the header bar for the therapist dashboard page.
 * Uses the same style as Header.tsx with Polariz logo and text on the left,
 * and Home and Me tabs on the right.
 */
const TherapistHeader = () => {
  const { profile } = useUserProfile();
  const location = useLocation();

  // Memoize the Me icon to prevent unnecessary re-renders
  const meIcon = useMemo(() => {
    if (profile && (profile as any).avatar_url) {
      return (
        <Avatar className="h-7 w-7 border-2 border-white">
          <AvatarImage src={(profile as any).avatar_url} alt="Me" />
          <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
        </Avatar>
      );
    }
    return <UserIcon className="h-5 w-5" />;
  }, [profile]);

  // Helper for menu icons - memoized to prevent recreation
  const NavItem = React.memo(({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive?: boolean }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Prevent navigation if already on the same route to avoid flickering
      if (location.pathname === to) {
        e.preventDefault();
        return false;
      }
    };

    return (
      <Link 
        to={to} 
        className={`flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-base px-2 ${
          isActive ? 'text-white' : ''
        }`}
        onClick={handleClick}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  });

  NavItem.displayName = 'NavItem';

  return (
    <header>
      <div className="w-full py-4 px-6 flex justify-between items-center bg-black text-white">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-6 w-auto" />
          <h1 className="text-xl font-bold">Polariz</h1>
        </div>

        <nav className="flex items-center gap-4">
          <NavItem 
            to="/therapist-dashboard" 
            icon={<Home className="h-5 w-5" />} 
            label="Home"
            isActive={location.pathname === '/therapist-dashboard'}
          />
          <NavItem 
            to="/therapist/try-ai" 
            icon={<Sparkles className="h-5 w-5" />} 
            label="Try AI"
            isActive={location.pathname === '/therapist/try-ai'}
          />
          {/* 'Me' icon & avatar case */}
          <NavItem 
            to="/therapist-my-profile"
            icon={meIcon}
            label="Me"
            isActive={location.pathname === '/therapist-my-profile'}
          />
        </nav>
      </div>
    </header>
  );
};

export default TherapistHeader;
