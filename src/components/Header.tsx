import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import { Home, Users, UserCircle, Book, Shield, User as UserIcon, LayoutDashboard, Store, Menu, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useUserProfile } from "../hooks/useUserProfile";

// NavItem for desktop navigation
const NavItem = ({ to, icon, label, isActive, onClick }: { to: string; icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 ${
      isActive ? 'bg-white/10 text-white' : ''
    }`}
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

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const { isAdmin } = useUserRole();
  const { profile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.id) {
      navigate(`/user-dashboard?userId=${user.id}`);
    } else {
      navigate('/user-dashboard');
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header>
      <div className="w-full py-3 sm:py-4 px-3 sm:px-4 md:px-6 flex justify-between items-center bg-black text-white relative">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-5 sm:h-6 w-auto" />
          <span className="text-base sm:text-lg md:text-xl font-bold">Polariz</span>
        </div>

        {/* Desktop Navigation - Hidden on mobile, shown on tablet and up */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
          <NavItem 
            to="/" 
            icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />} 
            label="Home"
            isActive={location.pathname === '/'}
          />
          {!isAuthenticated && (
            <>
              <NavItem 
                to="/our-story" 
                icon={<Book className="h-4 w-4 sm:h-5 sm:w-5" />} 
                label="Our Story"
                isActive={location.pathname === '/our-story'}
              />
              <NavItem 
                to="/meet-the-team" 
                icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} 
                label="Meet the Team"
                isActive={location.pathname === '/meet-the-team'}
              />
            </>
          )}
          {isAuthenticated && (
            <>
              <Link 
                to="/user-dashboard" 
                onClick={handleDashboardClick}
                className={`flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 ${
                  location.pathname === '/user-dashboard' ? 'bg-white/10 text-white' : ''
                }`}
              >
                <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">Dashboard</span>
              </Link>
              <NavItem 
                to="/consultation" 
                icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} 
                label="Coaches"
                isActive={location.pathname === '/consultation'}
              />
              <NavItem 
                to="/lessons-marketplace" 
                icon={<Store className="h-4 w-4 sm:h-5 sm:w-5" />} 
                label="MarketPlace"
                isActive={location.pathname === '/lessons-marketplace'}
              />
              {isAdmin() && (
                <NavItem 
                  to="/admin" 
                  icon={<Shield className="h-4 w-4 sm:h-5 sm:w-5" />} 
                  label="Admin"
                  isActive={location.pathname === '/admin'}
                />
              )}
              <NavItem 
                to="/my-profile" 
                icon={<UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
                label="Me"
                isActive={location.pathname === '/my-profile'}
              />
            </>
          )}
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
              to="/" 
              icon={<Home className="h-5 w-5" />} 
              label="Home"
              isActive={location.pathname === '/'}
              onClick={closeMobileMenu}
            />
            {!isAuthenticated && (
              <>
                <MobileNavItem 
                  to="/our-story" 
                  icon={<Book className="h-5 w-5" />} 
                  label="Our Story"
                  isActive={location.pathname === '/our-story'}
                  onClick={closeMobileMenu}
                />
                <MobileNavItem 
                  to="/meet-the-team" 
                  icon={<Users className="h-5 w-5" />} 
                  label="Meet the Team"
                  isActive={location.pathname === '/meet-the-team'}
                  onClick={closeMobileMenu}
                />
              </>
            )}
            {isAuthenticated && (
              <>
                <Link 
                  to="/user-dashboard" 
                  onClick={(e) => {
                    handleDashboardClick(e);
                    closeMobileMenu();
                  }}
                  className={`flex items-center gap-3 text-white hover:text-white/80 transition-colors font-medium text-base px-4 py-3 rounded-lg hover:bg-white/10 ${
                    location.pathname === '/user-dashboard' ? 'bg-white/10 text-white' : ''
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <MobileNavItem 
                  to="/consultation" 
                  icon={<Users className="h-5 w-5" />} 
                  label="Coaches"
                  isActive={location.pathname === '/consultation'}
                  onClick={closeMobileMenu}
                />
                <MobileNavItem 
                  to="/lessons-marketplace" 
                  icon={<Store className="h-5 w-5" />} 
                  label="MarketPlace"
                  isActive={location.pathname === '/lessons-marketplace'}
                  onClick={closeMobileMenu}
                />
                {isAdmin() && (
                  <MobileNavItem 
                    to="/admin" 
                    icon={<Shield className="h-5 w-5" />} 
                    label="Admin"
                    isActive={location.pathname === '/admin'}
                    onClick={closeMobileMenu}
                  />
                )}
                <MobileNavItem 
                  to="/my-profile" 
                  icon={<UserIcon className="h-5 w-5" />} 
                  label="Me"
                  isActive={location.pathname === '/my-profile'}
                  onClick={closeMobileMenu}
                />
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
