import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
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
  User,
  Search,
} from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getLoginUrl = () => {
    const redirectUrl = encodeURIComponent(window.location.href);
    return `/api/auth/login?redirect=${redirectUrl}`;
  };

  const navItems = [
    { href: "/", label: "Srautas", icon: Home },
    { href: "/bills", label: "Protokolai", icon: FileText },
    { href: "/mps", label: "Subjektai", icon: Users },
    { href: "/quiz", label: "Sutapimas", icon: HelpCircle },
  ];

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl"
      >
        {/* Radical Logo */}
        <Link href="/">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <span className="text-black font-black text-xs">SS</span>
          </div>
        </Link>

        {/* Dynamic Nav Items */}
        <div className="flex items-center gap-1 mx-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`relative px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/5 border border-white/10 rounded-full"
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Global Action */}
        <div className="h-6 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-2 pl-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-emerald-500">
                {user.name?.[0] || "U"}
              </div>
              <button
                onClick={() => logout()}
                className="text-slate-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-colors"
            >
              Identikuotis
            </button>
          )}

          <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
