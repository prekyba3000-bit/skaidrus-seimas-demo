import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  HelpCircle,
  LogOut,
  Sun,
  Activity,
  Feather
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getLoginUrl = () => {
    const redirectUrl = encodeURIComponent(window.location.href);
    return `/api/auth/login?redirect=${redirectUrl}`;
  };

  const navItems = [
    { href: "/", label: "Pradžia", icon: Sun },
    { href: "/dashboard", label: "Skydas", icon: Activity },
    { href: "/bills", label: "Projektai", icon: FileText },
    { href: "/mps", label: "Seimo Nariai", icon: Users },
    { href: "/quiz", label: "Apklausa", icon: Feather },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-fit">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 bg-[var(--peat-oak)]/90 backdrop-blur-md border border-[var(--amber-start)]/30 rounded-full shadow-xl shadow-[var(--amber-start)]/10"
      >
        {/* Logo */}
        <Link href="/" aria-label="Pagrindinis">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--amber-start)] to-[var(--amber-end)] rounded-full flex items-center justify-center cursor-pointer hover:rotate-90 transition-transform duration-700 shadow-inner">
            {/* Simple Sun Symbol derived from layout or just text */}
            <Sun className="h-6 w-6 text-[var(--peat-oak)]" />
          </div>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-1 mx-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-serif ${isActive
                      ? "text-[var(--amber-start)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--linen-white)]"
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="baltic-nav-pill"
                      className="absolute inset-0 bg-[var(--amber-start)]/10 border border-[var(--amber-start)]/30 rounded-full"
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-[var(--amber-start)]/20 mx-2" />

        {/* Auth Module */}
        <div className="flex items-center gap-2 ml-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--amber-start)]/10 border border-[var(--amber-start)]/30 flex items-center justify-center text-xs font-bold text-[var(--amber-end)]">
                {user.name?.[0] || "V"}
              </div>
              <button
                onClick={() => logout()}
                aria-label="Atsijungti"
                className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="px-6 py-2 bg-[var(--amber-start)] text-[var(--peat-oak)] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[var(--amber-end)] hover:text-white transition-colors shadow-lg shadow-[var(--amber-start)]/20 font-serif"
            >
              Prisijungti
            </button>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
