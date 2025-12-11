import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User as UserIcon, Sparkles, BookOpen, Users, Store, Menu, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

// NavItem for desktop navigation
const NavItem = ({ to, icon, label, isActive, onClick }: { to: string; icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void }) => (
  <Link 
    to={to}
    onClick={onClick}
    className={`flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 ${
      isActive ? 'bg-white/10 text-white' : ''
    }`}
    style={{ pointerEvents: 'auto' }}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </Link>
);

// Mobile NavItem with horizontal layout
const MobileNavItem = ({ to, icon, label, isActive, onClick }: { to: string; icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void }) => (
  <Link 
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 text-white hover:text-white/80 transition-colors font-medium text-base px-4 py-3 rounded-lg hover:bg-white/10 ${
      isActive ? 'bg-white/10 text-white' : ''
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

/**
 * TherapistHeader component displays the header bar for the therapist dashboard page.
 * Uses the same style as Header.tsx with Polariz logo and text on the left,
 * and navigation items on the right. Responsive with mobile hamburger menu.
 */
const TherapistHeader = () => {
  const { profile } = useUserProfile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Memoize icons to prevent recreation on each render
  const homeIcon = useMemo(() => <Home className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const usersIcon = useMemo(() => <Users className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const sparklesIcon = useMemo(() => <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const bookOpenIcon = useMemo(() => <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />, []);
  const storeIcon = useMemo(() => <Store className="h-4 w-4 sm:h-5 sm:w-5" />, []);

  // Mobile icons (slightly larger for better touch targets)
  const homeIconMobile = useMemo(() => <Home className="h-5 w-5" />, []);
  const usersIconMobile = useMemo(() => <Users className="h-5 w-5" />, []);
  const sparklesIconMobile = useMemo(() => <Sparkles className="h-5 w-5" />, []);
  const bookOpenIconMobile = useMemo(() => <BookOpen className="h-5 w-5" />, []);
  const storeIconMobile = useMemo(() => <Store className="h-5 w-5" />, []);

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

  const meIconMobile = useMemo(() => {
    if (profile && (profile as any).avatar_url) {
      return (
        <Avatar className="h-8 w-8 border-2 border-white">
          <AvatarImage src={(profile as any).avatar_url} alt="Me" />
          <AvatarFallback><UserIcon className="h-6 w-6" /></AvatarFallback>
        </Avatar>
      );
    }
    return <UserIcon className="h-5 w-5" />;
  }, [profile]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header>
      <div className="w-full py-3 sm:py-4 px-3 sm:px-4 md:px-6 flex justify-between items-center bg-black text-white relative">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-5 sm:h-6 w-auto" />
          <h1 className="text-base sm:text-lg md:text-xl font-bold">Polariz</h1>
        </div>

        {/* Desktop Navigation - Hidden on mobile, shown on tablet and up */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
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
          <NavItem 
            to="/lessons-marketplace" 
            icon={storeIcon} 
            label="MarketPlace"
            isActive={location.pathname === '/lessons-marketplace'}
          />
          {/* 'Me' icon & avatar case */}
          <NavItem 
            to="/therapist-my-profile"
            icon={meIcon}
            label="Me"
            isActive={location.pathname === '/therapist-my-profile'}
          />
        </nav>

        {/* Mobile Menu Button - Shown only on mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu - Shown only on mobile when menu is open */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <nav className="flex flex-col py-2">
            <MobileNavItem 
              to="/therapist-dashboard" 
              icon={homeIconMobile} 
              label="Home"
              isActive={location.pathname === '/therapist-dashboard'}
              onClick={closeMobileMenu}
            />
            <MobileNavItem 
              to="/therapist/learners" 
              icon={usersIconMobile} 
              label="Parents"
              isActive={location.pathname === '/therapist/learners'}
              onClick={closeMobileMenu}
            />
            <MobileNavItem 
              to="/therapist/try-ai" 
              icon={sparklesIconMobile} 
              label="Try AI"
              isActive={location.pathname === '/therapist/try-ai'}
              onClick={closeMobileMenu}
            />
            <MobileNavItem 
              to="/therapist/ai-lessons" 
              icon={bookOpenIconMobile} 
              label="AI Lessons"
              isActive={location.pathname === '/therapist/ai-lessons'}
              onClick={closeMobileMenu}
            />
            <MobileNavItem 
              to="/lessons-marketplace" 
              icon={storeIconMobile} 
              label="MarketPlace"
              isActive={location.pathname === '/lessons-marketplace'}
              onClick={closeMobileMenu}
            />
            <MobileNavItem 
              to="/therapist-my-profile"
              icon={meIconMobile}
              label="Me"
              isActive={location.pathname === '/therapist-my-profile'}
              onClick={closeMobileMenu}
            />
          </nav>
        </div>
      )}
    </header>
  );
};

export default TherapistHeader;
