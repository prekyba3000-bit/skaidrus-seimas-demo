import { useMemo } from "react";
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp,
  Gavel,
  ChevronRight,
  Plus
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: globalStats } = trpc.mps.globalStats.useQuery();
  const { data: bills } = trpc.bills.list.useQuery();

  const stats = [
    { name: "Viso Seimo narių", value: globalStats?.totalMps || 0, icon: Users, trend: "Nėra pokyčio", progress: null },
    { name: "Svarstomi projektai", value: globalStats?.totalBills || 0, icon: FileText, trend: "+2 nauji", progress: 45 },
    { name: "Vid. Lankomumas", value: `${globalStats?.avgAttendance || 0}%`, icon: Activity, trend: "+1.5%", progress: null },
    { name: "Priimta įstatymų", value: globalStats?.billsPassed || 0, icon: Gavel, trend: "Teigiama tendencija", progress: null },
  ];

  return (
    <DashboardLayout title="Valdymo Skydas">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 bg-surface-dark border border-surface-border rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#233648] transition-colors">
          <span className="text-[#92adc9] text-xs font-medium">Laikotarpis:</span>
          <span className="text-white text-sm font-medium">Paskutinės 24h</span>
          <ChevronRight className="w-4 h-4 text-[#92adc9] rotate-90" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex flex-col gap-1 rounded-xl p-5 bg-surface-dark border border-surface-border shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-[#92adc9] text-sm font-medium">{stat.name}</p>
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-white text-2xl font-bold">{stat.value}</p>
              {stat.trend.includes("+") && <p className="text-accent-green text-xs font-medium">{stat.trend}</p>}
              {!stat.trend.includes("+") && <p className="text-[#92adc9] text-xs font-normal">{stat.trend}</p>}
            </div>
            {stat.progress ? (
              <div className="w-full bg-[#233648] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${stat.progress}%` }}></div>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className={`w-3.5 h-3.5 ${stat.trend.includes("+") ? "text-accent-green" : "text-[#92adc9]"}`} />
                <p className="text-[#92adc9] text-xs">lyginant su praėjusia savaite</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Secondary Grid: Chart and Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* The Pulse Chart */}
        <div className="lg:col-span-2 rounded-xl bg-surface-dark border border-surface-border p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-white text-lg font-bold">Aktivumo Pulsas</h3>
              <p className="text-[#92adc9] text-sm">Politinis aktyvumas per parą</p>
            </div>
            <Badge className="bg-[#233648] text-primary hover:bg-[#233648] border-none px-3 py-1 font-bold text-[10px] tracking-wider">
              AUKŠTAS AKTYVUMAS
            </Badge>
          </div>
          <div className="flex-1 min-h-[250px] relative w-full px-2">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 150">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#137fec" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,120 Q50,40 100,80 T200,60 T300,100 T400,70 L400,150 L0,150 Z" 
                fill="url(#chartGradient)" 
              />
              <path 
                d="M0,120 Q50,40 100,80 T200,60 T300,100 T400,70" 
                fill="none" 
                stroke="#137fec" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="flex justify-between mt-4 border-t border-[#233648] pt-3 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-1 rounded-xl bg-surface-dark border border-surface-border p-0 flex flex-col h-full max-h-[400px] lg:max-h-full">
          <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-dark rounded-t-xl">
            <h3 className="text-white text-lg font-bold">Veiklos Srautas</h3>
            <Button variant="link" className="text-primary text-sm font-medium p-0 h-auto uppercase tracking-wider">Visi</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-cover bg-center shrink-0 border border-surface-border" style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=mp${i})` }} />
                <div className="flex flex-col gap-1">
                  <p className="text-white text-sm leading-snug">
                    <span className="font-extrabold">Seimo narys {i}</span> pateikė <span className="text-primary font-bold">įstatymo projektą Nr. {100-i}</span> dėl energetikos efektyvumo.
                  </p>
                  <span className="text-[#92adc9] text-[10px] font-bold uppercase tracking-widest">{i * 5} min. prieš</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl bg-surface-dark border border-surface-border p-6 flex flex-col gap-5">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              Naujausi Balsavimų Protokolai
            </h3>
            <p className="text-[#92adc9] text-sm mt-1">Svarbiausių Seimo balsavimų ir teisėkūros rezultatų apžvalga.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#18232e] p-1 rounded-lg border border-surface-border">
            <Button variant="secondary" size="sm" className="bg-[#233648] text-white text-xs font-bold px-4 hover:bg-[#324d67] border-none">Visi</Button>
            <div className="w-px h-4 bg-surface-border mx-1"></div>
            <Button variant="ghost" size="sm" className="text-[#92adc9] hover:text-white px-3 text-xs font-bold uppercase tracking-wider">Priimti</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="py-4 px-2 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest w-[120px]">Data</th>
                <th className="py-4 px-2 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Teisės Aktas</th>
                <th className="py-4 px-2 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest w-[100px]">Rezultatas</th>
                <th className="py-4 px-2 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest w-[180px]">Palaikymas</th>
                <th className="py-4 px-2 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {bills?.slice(0, 5).map(bill => (
                <tr key={bill.id} className="group hover:bg-[#18232e] transition-colors cursor-pointer">
                  <td className="py-5 px-2 text-white text-sm font-bold font-mono">
                    {bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString() : 'Šiandien'}
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white text-sm font-black group-hover:text-primary transition-colors leading-tight">{bill.title}</span>
                      <span className="text-[#92adc9] text-xs font-medium">{bill.category}</span>
                    </div>
                  </td>
                  <td className="py-5 px-2">
                    <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest border-2 ${
                      bill.status === 'passed' 
                        ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {bill.status === 'passed' ? 'PRIIMTA' : 'SVARSTOMA'}
                    </Badge>
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
                      <div className="flex justify-between text-[10px] text-[#92adc9] font-bold uppercase tracking-wider">
                        <span>Prieš {100 - (bill.status === 'passed' ? 70 : 45)}%</span>
                        <span>Už {bill.status === 'passed' ? 70 : 45}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#233648] rounded-full overflow-hidden flex">
                        <div className={`h-full ${bill.status === 'passed' ? 'bg-accent-green' : 'bg-primary'}`} style={{ width: bill.status === 'passed' ? '70%' : '45%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-2 text-right">
                    <ChevronRight className="w-5 h-5 text-[#92adc9] group-hover:text-white transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
