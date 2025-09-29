import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const isIndexPage = location.pathname === "/";

  const handleLogout = async () => {
    console.log('Header logout clicked');
    await logout();
  };

  return (
    <header>
      <div className="w-full py-4 px-6 flex justify-between items-center bg-black text-white">
        <div className="flex items-center gap-2">
          {/* Icon on the left */}
          <img src="/lovable-uploads/polariz_icon_only_white.png" alt="Polariz Logo" className="h-6 w-auto" />
          <h1 className="text-xl font-bold">Polariz</h1>
        </div>

        <nav className="flex items-center gap-4">
          <Link to="/" className="text-white hover:text-white/80 transition-colors font-medium">Home</Link>
          {!isAuthenticated && (
            <>
              <Link to="/our-story" className="text-white hover:text-white/80 transition-colors font-medium">Our Story</Link>
              <Link to="/meet-the-team" className="text-white hover:text-white/80 transition-colors font-medium">Meet the Team</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to="/user-dashboard" className="text-white hover:text-white/80 transition-colors font-medium">My Dashboard</Link>
              <Link to="/consultation" className="text-white hover:text-white/80 transition-colors font-medium">Coaches</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              {isAdmin() && (
                <Link to="/admin" className="text-white hover:text-white/80 transition-colors font-medium">Admin</Link>
              )}
              <Button 
                onClick={handleLogout} 
                variant="link" 
                className="text-white hover:text-white/80 transition-colors p-0 font-medium text-base"
              >
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>

      {!isAuthenticated && (
        <div className="h-[70vh] overflow-hidden relative">
          <img
            src="/lovable-uploads/frontpage1.png"
            alt="Banner image" 
            className="w-full object-cover object-center"
          />
        
          {/* Gray overlay */}
          <div className="absolute inset-0 bg-black/20"></div>

          <div className="absolute top-1/2 transform -translate-y-1/2 right-12 md:right-24 lg:right-32 max-w-md text-right z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-loose tracking-wide mb-6">
              Shaping future one word at a time
            </h2>
            <p className="text-sm md:text-base text-white leading-loose tracking-wide">
              AI speech therapists that turn home into learning hubs and parents into expert teachers
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
