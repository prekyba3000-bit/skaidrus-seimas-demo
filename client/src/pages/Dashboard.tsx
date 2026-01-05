import { useMemo } from "react";
import {
  Users,
  FileText,
  Activity,
  Award,
  TrendingUp,
  MapPin,
  Bell,
  MessageSquare,
  Search,
  ChevronRight,
  Gavel,
  Shield,
  Target,
  Globe
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BalticPatternBorder } from "@/components/BalticPatternBorder";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: globalStats } = trpc.mps.globalStats.useQuery();
  const { data: mps } = trpc.mps.list.useQuery({ isActive: true });
  const { data: bills } = trpc.bills.list.useQuery();

  // Pick top 3 spenders mock logic (since we don't have cost in schema yet, we'll use attendance as a proxy for engagement)
  const topMps = useMemo(() => {
    if (!mps) return [];
    return [...mps].slice(0, 3);
  }, [mps]);

  return (
    <div className="min-h-screen bg-[var(--background)] relative pb-20">
      <div className="grain-overlay" />
      <div className="fixed inset-0 baltic-pattern-bg pointer-events-none" />

      <main className="container px-6 pt-32 relative z-10">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight uppercase text-[var(--foreground)] mb-4">
            Valdymo <span className="text-[var(--amber-start)]">Skydas</span>
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl font-serif italic text-lg">
            Sisteminė Seimo veiklos apžvalga realiuoju laiku. Analizuokite lėšų panaudojimą, balsavimų tendencijas ir atskaitomybės rodiklius.
          </p>
        </header>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <BalticPatternBorder variant="simple">
            <div className="p-6 bg-[var(--card)]/80">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Viso narių</p>
                <Users className="h-5 w-5 text-[var(--amber-start)]" />
              </div>
              <p className="text-4xl font-black text-[var(--foreground)] font-mono">{globalStats?.totalMps || 0}</p>
              <p className="text-xs text-[var(--copper-moss)] mt-2 font-bold uppercase tracking-wider">Aktyvūs mandatai</p>
            </div>
          </BalticPatternBorder>

          <BalticPatternBorder variant="simple">
            <div className="p-6 bg-[var(--card)]/80">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Projektai eigoje</p>
                <FileText className="h-5 w-5 text-[var(--amber-start)]" />
              </div>
              <p className="text-4xl font-black text-[var(--foreground)] font-mono">{globalStats?.totalBills || 0}</p>
              <div className="mt-4">
                <Progress value={45} className="h-1 bg-[var(--muted)]" indicatorClassName="bg-[var(--amber-start)]" />
              </div>
            </div>
          </BalticPatternBorder>

          <BalticPatternBorder variant="simple">
            <div className="p-6 bg-[var(--card)]/80">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Vid. Lankomumas</p>
                <Activity className="h-5 w-5 text-[var(--amber-start)]" />
              </div>
              <p className="text-4xl font-black text-[var(--foreground)] font-mono">{globalStats?.avgAttendance || 0}%</p>
              <p className="text-xs text-[var(--copper-moss)] mt-2 font-bold uppercase tracking-wider">Augimas +1.2%</p>
            </div>
          </BalticPatternBorder>

          <BalticPatternBorder variant="simple">
            <div className="p-6 bg-[var(--card)]/80">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Priimta įstatymų</p>
                <Award className="h-5 w-5 text-[var(--amber-start)]" />
              </div>
              <p className="text-4xl font-black text-[var(--foreground)] font-mono">{globalStats?.billsPassed || 0}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-2 font-bold uppercase tracking-wider">Šioje sesijoje</p>
            </div>
          </BalticPatternBorder>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Visualization Area */}
          <div className="lg:col-span-2">
            <BalticPatternBorder variant="sun">
              <div className="p-8 bg-[var(--card)]/90 h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold uppercase text-[var(--foreground)]">Veiklos Pulsas</h3>
                    <p className="text-sm text-[var(--muted-foreground)] font-serif italic">Politinio aktyvumo dinamika per 24 valandas</p>
                  </div>
                  <Badge variant="outline" className="border-[var(--amber-start)] text-[var(--amber-start)] px-4 py-1">
                    AUKŠTAS AKTYVUMAS
                  </Badge>
                </div>
                <div className="flex-1 relative">
                   {/* Simplified Pulse Path */}
                   <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <path
                      d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,40"
                      fill="none"
                      stroke="var(--amber-start)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,40 L400,100 L0,100 Z"
                      fill="url(#pulseGradient)"
                      opacity="0.1"
                    />
                    <defs>
                      <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--amber-start)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                   </svg>
                </div>
              </div>
            </BalticPatternBorder>
          </div>

          {/* Right Sidebar: Feed */}
          <div className="lg:col-span-1">
            <BalticPatternBorder variant="simple">
              <div className="p-0 bg-[var(--card)]/80 flex flex-col h-full max-h-[400px]">
                <div className="p-4 border-b border-[var(--amber-start)]/20 flex justify-between items-center sticky top-0 bg-[var(--card)] z-10">
                   <h3 className="text-lg font-bold uppercase tracking-widest text-[var(--foreground)]">Srautas</h3>
                   <Button variant="link" className="text-[var(--amber-end)] text-xs uppercase font-bold tracking-widest">VISI</Button>
                </div>
                <div className="p-4 overflow-y-auto space-y-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="w-10 h-10 rounded-full bg-[var(--amber-start)]/10 flex items-center justify-center shrink-0 border border-[var(--amber-start)]/20">
                        <Target className="h-4 w-4 text-[var(--amber-end)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--foreground)] leading-tight">
                          <span className="font-bold">Naujas balsavimas:</span> Energijos išteklių įstatymo pataisa praėjo III svarstymą.
                        </p>
                        <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold tracking-widest block mt-1">Prieš 5 min.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BalticPatternBorder>
          </div>
        </div>

        {/* Bottom Section: Voting Records */}
        <div className="grid grid-cols-1 gap-8">
            <BalticPatternBorder variant="simple">
              <div className="p-8 bg-[var(--card)]/90">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-[var(--foreground)] flex items-center gap-3">
                    <Gavel className="h-6 w-6 text-[var(--amber-start)]" />
                    Balsavimo Protokolai
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs uppercase font-bold tracking-widest border-[var(--amber-start)]/30 hover:bg-[var(--amber-start)]/10">Visi</Button>
                    <Button variant="outline" size="sm" className="text-xs uppercase font-bold tracking-widest border-[var(--amber-start)]/30 hover:bg-[var(--amber-start)]/10">Priimti</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--amber-start)]/20">
                        <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Data</th>
                        <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Teisės Aktas</th>
                        <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Rezultatas</th>
                        <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)]">Pažanga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--amber-start)]/10">
                      {bills?.slice(0, 5).map(bill => (
                        <tr key={bill.id} className="group hover:bg-[var(--amber-start)]/5 transition-colors cursor-pointer">
                          <td className="py-6 text-sm font-bold text-[var(--linen-white)]">{new Date(bill.createdAt || '').toLocaleDateString()}</td>
                          <td className="py-6">
                            <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--amber-end)] transition-colors">{bill.title}</p>
                            <span className="text-[10px] uppercase text-[var(--muted-foreground)] tracking-widest font-bold">{bill.category}</span>
                          </td>
                          <td className="py-6">
                            <Badge className={bill.status === 'passed' ? 'bg-[var(--copper-moss)]/20 text-[var(--copper-moss)] border-[var(--copper-moss)]/30' : 'bg-[var(--amber-start)]/20 text-[var(--amber-start)] border-[var(--amber-start)]/30'}>
                              {bill.status === 'passed' ? 'PRIIMTA' : 'SVARSTOMA'}
                            </Badge>
                          </td>
                          <td className="py-6 w-48">
                            <Progress value={bill.status === 'passed' ? 100 : 40} className="h-1 bg-[var(--muted)]" indicatorClassName={bill.status === 'passed' ? 'bg-[var(--copper-moss)]' : 'bg-[var(--amber-start)]'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </BalticPatternBorder>
        </div>
      </main>
    </div>
  );
}
