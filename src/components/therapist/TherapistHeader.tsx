import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User as UserIcon, Sparkles, BookOpen, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

// NavItem defined outside component to prevent recreation on each render
const NavItem = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive?: boolean }) => (
  <Link 
    to={to}
    className={`flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 ${
      isActive ? 'text-white' : ''
    }`}
    style={{ pointerEvents: 'auto' }}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </Link>
);

/**
 * TherapistHeader component displays the header bar for the therapist dashboard page.
 * Uses the same style as Header.tsx with Polariz logo and text on the left,
 * and Home and Me tabs on the right.
 */
const TherapistHeader = () => {
  const { profile } = useUserProfile();
  const location = useLocation();

  // Memoize icons to prevent recreation on each render
  const homeIcon = useMemo(() => <Home className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const usersIcon = useMemo(() => <Users className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const sparklesIcon = useMemo(() => <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const bookOpenIcon = useMemo(() => <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />, []);

  // Memoize Me icon based on profile to prevent flickering
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

  return (
    <header>
      <div className="w-full py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center bg-black text-white relative">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-5 sm:h-6 w-auto" />
          <h1 className="text-lg sm:text-xl font-bold">Polariz</h1>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <NavItem 
            to="/therapist-dashboard" 
            icon={homeIcon} 
            label="Home"
            isActive={location.pathname === '/therapist-dashboard'}
          />
          <NavItem 
            to="/therapist/learners" 
            icon={usersIcon} 
            label="Parents"
            isActive={location.pathname === '/therapist/learners'}
          />
          <NavItem 
            to="/therapist/try-ai" 
            icon={sparklesIcon} 
            label="Try AI"
            isActive={location.pathname === '/therapist/try-ai'}
          />
          <NavItem 
            to="/therapist/ai-lessons" 
            icon={bookOpenIcon} 
            label="AI Lessons"
            isActive={location.pathname === '/therapist/ai-lessons'}
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
