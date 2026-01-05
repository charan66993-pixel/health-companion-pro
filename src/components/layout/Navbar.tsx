import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Menu, X, User, LogOut, Activity, UserRound, Calendar } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              to="/symptom-checker"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Activity className="w-4 h-4" />
              Symptom Checker
            </Link>
            <Link
              to="/doctors"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <UserRound className="w-4 h-4" />
              Doctors
            </Link>
            <Link
              to="/appointments"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Appointments
            </Link>
            {user && (
              <Link
                to="/health-history"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Health History
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="default" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/symptom-checker"
                className="px-4 py-2 text-muted-foreground hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Activity className="w-4 h-4" />
                Symptom Checker
              </Link>
              <Link
                to="/doctors"
                className="px-4 py-2 text-muted-foreground hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserRound className="w-4 h-4" />
                Doctors
              </Link>
              <Link
                to="/appointments"
                className="px-4 py-2 text-muted-foreground hover:text-foreground flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="w-4 h-4" />
                Appointments
              </Link>
              {user && (
                <Link
                  to="/health-history"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Health History
                </Link>
              )}
              <div className="px-4 pt-4 border-t border-border">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
