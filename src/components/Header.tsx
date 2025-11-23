import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import { Home, Users, UserCircle, Book, Shield, User as UserIcon, LayoutDashboard, Store } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useUserProfile } from "../hooks/useUserProfile";

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useUserRole();
  const { profile } = useUserProfile();

  // Helper for menu icons
  const NavItem = ({ to, icon, label, children = null }: { to: string; icon: React.ReactNode; label: string; children?: React.ReactNode }) => (
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
          <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
          {!isAuthenticated && (
            <>
              <NavItem to="/our-story" icon={<Book className="h-5 w-5" />} label="Our Story" />
              <NavItem to="/meet-the-team" icon={<Users className="h-5 w-5" />} label="Meet the Team" />
            </>
          )}
          {isAuthenticated && (
            <>
              <NavItem to="/user-dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
              <NavItem to="/consultation" icon={<Users className="h-5 w-5" />} label="Coaches" />
              <NavItem to="/lessons-marketplace" icon={<Store className="h-5 w-5" />} label="MarketPlace" />
              {isAdmin() && (
                <NavItem to="/admin" icon={<Shield className="h-5 w-5" />} label="Admin" />
              )}
              {/* 'Me' icon */}
              <NavItem to="/my-profile"
                icon={<UserIcon className="h-5 w-5" />}
                label="Me"
              />
            </>
          )}
        </nav>
      </div>
      {/* The large banner image and text underneath is removed, as now shown in Index.tsx */}
    </header>
  );
};

export default Header;
