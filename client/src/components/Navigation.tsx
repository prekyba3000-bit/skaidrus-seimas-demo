import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Home, 
  FileText, 
  Users, 
  Map, 
  HelpCircle,
  LogIn,
  LogOut,
  User
} from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const getLoginUrl = () => {
    const redirectUrl = encodeURIComponent(window.location.href);
    return `/api/auth/login?redirect=${redirectUrl}`;
  };

  const navItems = [
    { href: "/", label: "Pradžia", icon: Home },
    { href: "/bills", label: "Įstatymai", icon: FileText },
    { href: "/mps", label: "Seimo Nariai", icon: Users },
    { href: "/map", label: "Žemėlapis", icon: Map },
    { href: "/quiz", label: "Politinis Tinderis", icon: HelpCircle },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-105 transition-transform">
                SS
              </div>
              <span className="font-bold text-xl hidden sm:inline">Skaidrus Seimas</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.name || user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Atsijungti
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Prisijungti
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto pb-2 gap-1 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
