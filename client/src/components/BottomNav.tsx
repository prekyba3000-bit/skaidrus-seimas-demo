import { Link, useLocation } from "wouter";
import { Home, Users, FileText, BarChart, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";

const ITEMS: { href: string; label: string; icon: typeof Home }[] = [
  { href: "/", label: "Pradžia", icon: Home },
  { href: "/mps", label: "Nariai", icon: Users },
  { href: "/bills", label: "Balsavimai", icon: FileText },
  { href: "/pulse", label: "Pulsas", icon: BarChart },
  { href: "/compare", label: "Palyginti", icon: ArrowLeftRight },
];

export function BottomNav() {
  const [location] = useLocation();
  const closeSidebar = useUIStore(s => s.closeSidebar);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around gap-1 px-2 py-2 bg-emerald-950/95 backdrop-blur-xl border-t border-emerald-800/30"
      role="navigation"
      aria-label="Pagrindinė navigacija"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? location === "/"
            : location === href || location.startsWith(href + "/");
        return (
          <Link key={href} href={href}>
            <a
              onClick={closeSidebar}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-xl transition-colors touch-manipulation",
                active
                  ? "text-primary bg-primary/10"
                  : "text-emerald-200/70 hover:text-white hover:bg-emerald-900/40"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {label}
              </span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
