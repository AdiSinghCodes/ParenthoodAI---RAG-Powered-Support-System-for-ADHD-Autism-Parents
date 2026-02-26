import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageCircle, Home, Gamepad2, User, LogOut, Bell, Sparkles, ChevronDown } from "lucide-react";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = authService.getUser();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-indigo-100/50 shadow-lg shadow-indigo-100/50">
      <div className="container flex h-20 items-center justify-between px-6">
        {/* Logo Section with Enhanced Animation */}
        <Link to="/" className="flex items-center space-x-3 group relative">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-md group-hover:blur-lg transition-all duration-500 opacity-40"></div>
            <img
              src="/public/parent.jpeg"
              alt="ParenthoodAI Logo"
              className="relative h-14 w-14 rounded-full object-cover ring-2 ring-indigo-200 group-hover:ring-4 group-hover:ring-purple-400 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6"
            />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg shadow-green-500/50"></div>
            <Sparkles className="absolute -top-1 -left-1 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
              Parenthood AI
            </span>
            <span className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors duration-300">Your AI Parenting Partner ✨</span>
          </div>
        </Link>

        {/* Navigation Links with Enhanced Styling */}
        <nav className="flex items-center space-x-2">
          <Link
            to="/"
            className={cn(
              "group relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105",
              isActive("/")
                ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-300/50"
                : "text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
            )}
          >
            <Home className={cn("h-5 w-5 transition-transform duration-300", isActive("/") ? "" : "group-hover:scale-110")} />
            <span>Home</span>
            {isActive("/") && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-xl animate-pulse"></div>
            )}
          </Link>
          
          <Link
            to="/chat"
            className={cn(
              "group relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105",
              isActive("/chat")
                ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-300/50"
                : "text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
            )}
          >
            <MessageCircle className={cn("h-5 w-5 transition-transform duration-300", isActive("/chat") ? "" : "group-hover:scale-110")} />
            <span>Chat</span>
            {isActive("/chat") && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-xl animate-pulse"></div>
            )}
          </Link>
          
          <Link
            to="/activity"
            className={cn(
              "group relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105",
              isActive("/activity")
                ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-300/50"
                : "text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
            )}
          >
            <Gamepad2 className={cn("h-5 w-5 transition-transform duration-300", isActive("/activity") ? "" : "group-hover:scale-110 group-hover:rotate-12")} />
            <span>Activity</span>
            {isActive("/activity") && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-xl animate-pulse"></div>
            )}
          </Link>
          
          {/* Notification Bell */}
          <button className="relative p-3 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Profile Section with Dropdown */}
          <div className="relative ml-4">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 border border-indigo-200/50"
            >
              <div className="relative">
                <div className="h-9 w-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  <User className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-700">Welcome</span>
                <span className="text-xs text-indigo-600">{user?.username || user?.email || "User"}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-600 transition-transform duration-300", showProfileMenu && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-indigo-100 overflow-hidden animate-fade-in">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <p className="text-sm font-semibold text-gray-700">{user?.username || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <User className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 border-t border-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
