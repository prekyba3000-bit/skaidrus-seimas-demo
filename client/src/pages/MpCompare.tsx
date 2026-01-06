import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Trophy, Vote, FileText, CheckCircle2 } from "lucide-react";

export default function MpCompare() {
  const [mp1Id, setMp1Id] = useState<string>("");
  const [mp2Id, setMp2Id] = useState<string>("");

  const { data: allMps } = trpc.mps.list.useQuery({ isActive: true });
  
  const { data: comparison, isLoading } = trpc.mps.compare.useQuery(
    { mpId1: parseInt(mp1Id), mpId2: parseInt(mp2Id) },
    { enabled: !!mp1Id && !!mp2Id && mp1Id !== mp2Id }
  );

  const sortedMps = allMps?.slice().sort((a, b) => a.name.localeCompare(b.name, "lt")) || [];

  return (
     <DashboardLayout title="MP Comparison">
        {/* Selection Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* MP 1 Select */}
            <Card className="bg-surface-dark border-surface-border">
                <CardContent className="p-6">
                    <label className="block text-sm text-[#92adc9] mb-2 uppercase tracking-wide">Select MP 1</label>
                    <Select value={mp1Id} onValueChange={setMp1Id}>
                        <SelectTrigger className="w-full bg-background border-surface-border text-white">
                            <SelectValue placeholder="Choose Politician..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {sortedMps.map(mp => (
                                <SelectItem key={mp.id} value={mp.id.toString()} disabled={mp.id.toString() === mp2Id}>
                                    {mp.name} ({mp.party})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

             {/* MP 2 Select */}
            <Card className="bg-surface-dark border-surface-border">
                <CardContent className="p-6">
                    <label className="block text-sm text-[#92adc9] mb-2 uppercase tracking-wide">Select MP 2</label>
                    <Select value={mp2Id} onValueChange={setMp2Id}>
                        <SelectTrigger className="w-full bg-background border-surface-border text-white">
                            <SelectValue placeholder="Choose Politician..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                             {sortedMps.map(mp => (
                                <SelectItem key={mp.id} value={mp.id.toString()} disabled={mp.id.toString() === mp1Id}>
                                    {mp.name} ({mp.party})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>

        {/* Comparison Content */}
        {isLoading && (
            <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[#92adc9]">Analyzing voting records...</p>
            </div>
        )}

        {comparison && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Profile Cards */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     {/* MP 1 Profile */}
                     <Link href={`/mp/${comparison.mp1.id}`} className="flex-1 w-full relative group">
                        <div className="absolute inset-0 bg-primary/10 rounded-xl blur-lg group-hover:bg-primary/20 transition-all"></div>
                        <Card className="relative bg-surface-dark border-surface-border hover:border-primary/50 transition-colors">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <Avatar className="w-24 h-24 border-2 border-primary mb-4">
                                    <AvatarImage src={comparison.mp1.photoUrl || undefined} className="object-cover"/>
                                    <AvatarFallback>{comparison.mp1.name[0]}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold text-white">{comparison.mp1.name}</h3>
                                <p className="text-sm text-[#92adc9]">{comparison.mp1.party}</p>
                            </CardContent>
                        </Card>
                     </Link>

                     {/* VS Badge */}
                     <div className="bg-primary text-black font-black text-2xl w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 shadow-lg glow-primary">
                        VS
                     </div>

                     {/* MP 2 Profile */}
                     <Link href={`/mp/${comparison.mp2.id}`} className="flex-1 w-full relative group">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-lg group-hover:bg-blue-500/20 transition-all"></div>
                        <Card className="relative bg-surface-dark border-surface-border hover:border-blue-500/50 transition-colors">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <Avatar className="w-24 h-24 border-2 border-blue-500 mb-4">
                                     <AvatarImage src={comparison.mp2.photoUrl || undefined} className="object-cover"/>
                                    <AvatarFallback>{comparison.mp2.name[0]}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold text-white">{comparison.mp2.name}</h3>
                                <p className="text-sm text-[#92adc9]">{comparison.mp2.party}</p>
                            </CardContent>
                        </Card>
                     </Link>
                </div>

                {/* Agreement Score Card */}
                 <Card className="bg-surface-dark border-surface-border overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-sm uppercase tracking-widest text-[#92adc9] mb-2">Voting Agreement</h2>
                        <div className="relative inline-flex items-center justify-center">
                             <span className="text-6xl font-black text-white tracking-tighter">
                                {comparison.agreementScore.toFixed(0)}%
                             </span>
                        </div>
                        <p className="text-sm text-[#92adc9] mt-2">
                            They voted the same way in <span className="text-white font-bold">{comparison.commonVotes}</span> shared votes.
                        </p>
                    </CardContent>
                </Card>

                {/* Stat Comparison Table */}
                 <div className="grid gap-4">
                    <ComparisonRow 
                        label="Accountability Score" 
                        icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                        val1={comparison.mp1.stats?.accountabilityScore} 
                        val2={comparison.mp2.stats?.accountabilityScore}
                        suffix=""
                    />
                    <ComparisonRow 
                        label="Voting Attendance" 
                        icon={<Vote className="w-4 h-4 text-green-500" />}
                        val1={comparison.mp1.stats?.votingAttendance} 
                        val2={comparison.mp2.stats?.votingAttendance}
                        suffix="%"
                    />
                    <ComparisonRow 
                        label="Party Loyalty" 
                        icon={<CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        val1={comparison.mp1.stats?.partyLoyalty} 
                        val2={comparison.mp2.stats?.partyLoyalty}
                        suffix="%"
                    />
                    <ComparisonRow 
                        label="Bills Proposed" 
                        icon={<FileText className="w-4 h-4 text-purple-500" />}
                        val1={comparison.mp1.stats?.billsProposed} 
                        val2={comparison.mp2.stats?.billsProposed}
                        suffix=""
                    />
                 </div>
            </div>
        )}
        
        {(!mp1Id || !mp2Id) && !isLoading && (
             <div className="text-center py-20 opacity-50">
                <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-[#92adc9]" />
                <h3 className="text-xl font-bold text-white">Select MPs to Compare</h3>
                <p className="text-[#92adc9]">Choose two politicians to see how they stack up.</p>
             </div>
        )}
     </DashboardLayout>
  )
}

function ComparisonRow({ label, icon, val1, val2, suffix }: { label: string, icon: any, val1: any, val2: any, suffix: string }) {
    const v1 = parseFloat(val1 || "0");
    const v2 = parseFloat(val2 || "0");
    
    // Determine winner color
    const win1 = v1 > v2;
    const win2 = v2 > v1;

    return (
        <Card className="bg-surface-dark border-surface-border overflow-hidden">
            <CardContent className="p-4 grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_150px_1fr] items-center gap-4 relative z-10">
                 {/* Left Value */}
                 <div className={`text-right ${win1 ? "text-primary font-bold" : "text-white"}`}>
                    <span className="text-xl">{Number.isInteger(v1) ? v1 : v1.toFixed(1)}{suffix}</span>
                 </div>

                 {/* Center Label */}
                 <div className="flex flex-col items-center justify-center text-center px-2">
                    <div className="mb-1 opacity-80">{icon}</div>
                    <span className="text-xs text-[#92adc9] uppercase font-medium">{label}</span>
                 </div>

                 {/* Right Value */}
                 <div className={`text-left ${win2 ? "text-blue-500 font-bold" : "text-white"}`}>
                    <span className="text-xl">{Number.isInteger(v2) ? v2 : v2.toFixed(1)}{suffix}</span>
                 </div>
            </CardContent>
            {/* Visual Bar at bottom */}
             <div className="h-1 w-full bg-[#1A2633] flex">
                <div 
                    className="h-full bg-primary transition-all duration-500" 
                    // eslint-disable-next-line
                    style={{ flex: v1 }}
                ></div>
                 <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    // eslint-disable-next-line
                    style={{ flex: v2 }}
                ></div>
             </div>
        </Card>
    );
}
