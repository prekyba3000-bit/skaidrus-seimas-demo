import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Map as MapIcon, 
  Settings, 
  Menu, 
  Search, 
  Bell, 
  MessageSquare,
  Building2,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navigation = [
    { name: "Apžvalga", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pulsas", href: "/pulse", icon: Activity },
    { name: "Seimo nariai", href: "/", icon: Users },
    { name: "Palyginimas", href: "/compare", icon: ArrowLeftRight },
    { name: "Žemėlapis", href: "/map", icon: MapIcon },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-surface-dark border-r border-surface-border flex-shrink-0 flex-col justify-between h-full hidden md:flex transition-all duration-300`}>
        <div className="flex flex-col p-4 gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-primary/20 flex items-center justify-center aspect-square rounded-lg size-10 text-primary">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-bold leading-normal">MP Tracker</h1>
              <p className="text-[#92adc9] text-xs font-normal leading-normal">Seimo Stebėsenai</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-[#233648] text-white" 
                      : "text-[#92adc9] hover:text-white hover:bg-[#233648]"
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <p className="text-sm font-medium leading-normal">{item.name}</p>
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4">
          <Link href="/settings">
            <a className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[#92adc9] hover:text-white hover:bg-[#233648] transition-colors ${location === '/settings' ? "bg-[#233648] text-white" : ""}`}>
              <Settings className="w-5 h-5" />
              <p className="text-sm font-medium leading-normal">Nustatymai</p>
            </a>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="flex items-center justify-between border-b border-surface-border bg-surface-dark px-6 py-3 flex-shrink-0 z-10">
          <div className="flex items-center gap-8 w-full max-w-2xl">
            <button className="md:hidden text-white" aria-label="Atidaryti meniu" title="Meniu">
              <Menu className="w-6 h-6" />
            </button>

            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">{title}</h2>
            <div className="flex flex-col flex-1 max-w-[400px]">
              <div className="flex w-full items-stretch rounded-lg h-10 bg-[#233648] overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="text-[#92adc9] flex items-center justify-center pl-3">
                  <Search className="w-4 h-4" />
                </div>
                <Input 
                  className="bg-transparent border-none text-white placeholder:text-[#92adc9] px-3 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full w-full" 
                  placeholder="Ieškoti Seimo nario, įstatymo..." 
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 bg-[#233648] hover:bg-[#324d67] text-white" aria-label="Pranešimai" title="Pranešimai">
                <Bell className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="h-10 w-10 bg-[#233648] hover:bg-[#324d67] text-white" aria-label="Žinutės" title="Žinutės">
                <MessageSquare className="w-5 h-5" />
              </Button>

            </div>
            <Avatar className="h-10 w-10 border-2 border-[#233648] cursor-pointer">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=politician" />
              <AvatarFallback>MP</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background custom-scrollbar">
          <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
