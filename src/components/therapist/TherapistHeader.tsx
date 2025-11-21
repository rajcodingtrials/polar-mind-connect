import React from "react";
import { Link } from "react-router-dom";
import { Home, User as UserIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

/**
 * TherapistHeader component displays the header bar for the therapist dashboard page.
 * Uses the same style as Header.tsx with Polariz logo and text on the left,
 * and Home and Me tabs on the right.
 */
const TherapistHeader = () => {
  const { profile } = useUserProfile();

  // Helper for menu icons
  const NavItem = ({ to, icon, label, children }: { to: string; icon: React.ReactNode; label: string; children?: React.ReactNode }) => (
    <Link to={to} className="flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-base px-2">
      {icon}
      <span>{label}</span>
      {children}
    </Link>
  );

  return (
    <header>
      <div className="w-full py-4 px-6 flex justify-between items-center bg-black text-white">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-6 w-auto" />
          <h1 className="text-xl font-bold">Polariz</h1>
        </div>

        <nav className="flex items-center gap-4">
          <NavItem to="/therapist-dashboard" icon={<Home className="h-5 w-5" />} label="Home" />
          {/* 'Me' icon & avatar case */}
          <NavItem to="/my-profile"
            icon={profile && (profile as any).avatar_url ? (
              <Avatar className="h-7 w-7 border-2 border-white">
                <AvatarImage src={(profile as any).avatar_url} alt="Me" />
                <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
              </Avatar>
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
            label="Me"
          />
        </nav>
      </div>
    </header>
  );
};

export default TherapistHeader;
