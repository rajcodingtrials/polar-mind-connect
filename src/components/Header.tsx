import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import { Home, Users, UserCircle, Book, Shield, User as UserIcon, LayoutDashboard, Store, Menu, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useUserProfile } from "../hooks/useUserProfile";

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useUserRole();
  const { profile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper for menu icons
  const NavItem = ({ to, icon, label, children = null, onClick }: { to: string; icon: React.ReactNode; label: string; children?: React.ReactNode; onClick?: () => void }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors font-medium text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10"
    >
      {icon}
      <span className="text-xs">{label}</span>
      {children}
    </Link>
  );

  return (
    <header>
      <div className="w-full py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center bg-black text-white relative">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-5 sm:h-6 w-auto" />
          <h1 className="text-lg sm:text-xl font-bold">Polariz</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
          <NavItem to="/" icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />} label="Home" />
          {!isAuthenticated && (
            <>
              <NavItem to="/our-story" icon={<Book className="h-4 w-4 sm:h-5 sm:w-5" />} label="Our Story" />
              <NavItem to="/meet-the-team" icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} label="Meet the Team" />
            </>
          )}
          {isAuthenticated && (
            <>
              <NavItem to="/user-dashboard" icon={<LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />} label="Dashboard" />
              <NavItem to="/consultation" icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} label="Coaches" />
              <NavItem to="/lessons-marketplace" icon={<Store className="h-4 w-4 sm:h-5 sm:w-5" />} label="MarketPlace" />
              {isAdmin() && (
                <NavItem to="/admin" icon={<Shield className="h-4 w-4 sm:h-5 sm:w-5" />} label="Admin" />
              )}
              <NavItem to="/my-profile" icon={<UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />} label="Me" />
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <nav className="flex flex-col py-2">
            <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" onClick={() => setMobileMenuOpen(false)} />
            {!isAuthenticated && (
              <>
                <NavItem to="/our-story" icon={<Book className="h-5 w-5" />} label="Our Story" onClick={() => setMobileMenuOpen(false)} />
                <NavItem to="/meet-the-team" icon={<Users className="h-5 w-5" />} label="Meet the Team" onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
            {isAuthenticated && (
              <>
                <NavItem to="/user-dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <NavItem to="/consultation" icon={<Users className="h-5 w-5" />} label="Coaches" onClick={() => setMobileMenuOpen(false)} />
                <NavItem to="/lessons-marketplace" icon={<Store className="h-5 w-5" />} label="MarketPlace" onClick={() => setMobileMenuOpen(false)} />
                {isAdmin() && (
                  <NavItem to="/admin" icon={<Shield className="h-5 w-5" />} label="Admin" onClick={() => setMobileMenuOpen(false)} />
                )}
                <NavItem to="/my-profile" icon={<UserIcon className="h-5 w-5" />} label="Me" onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
