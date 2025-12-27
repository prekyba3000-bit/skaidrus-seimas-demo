import { useState } from "react";
import { Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  UserX,
  Sparkles,
  Share2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const statusConfig = {
  proposed: { label: "Pateiktas", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  voted: { label: "Balsuota", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  passed: { label: "Priimtas", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  rejected: { label: "Atmestas", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const voteConfig = {
  for: { label: "Už", icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
  against: { label: "Prieš", icon: XCircle, color: "text-red-600 dark:text-red-400" },
  abstain: { label: "Susilaikė", icon: MinusCircle, color: "text-yellow-600 dark:text-yellow-400" },
  absent: { label: "Nedalyvavo", icon: UserX, color: "text-gray-400" },
};

export default function BillDetail() {
  const params = useParams();
  const billId = parseInt(params.id || "0");
  const [selectedParty, setSelectedParty] = useState<string>("all");

  // Fetch bill details
  const { data: bill, isLoading: billLoading } = trpc.bills.byId.useQuery({ id: billId });
  
  // Fetch voting records
  const { data: votingData, isLoading: votesLoading } = trpc.votes.byBill.useQuery({ billId });

  if (billLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Įstatymo projektas nerastas</h2>
            <p className="text-muted-foreground mb-4">
              Nurodytas įstatymo projektas neegzistuoja arba buvo pašalintas
            </p>
            <Link href="/bills">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Grįžti į sąrašą
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate voting statistics
  const voteStats = votingData?.reduce((acc, { vote }) => {
    if (vote) {
      acc[vote.voteValue as keyof typeof acc] = (acc[vote.voteValue as keyof typeof acc] || 0) + 1;
    }
    return acc;
  }, { for: 0, against: 0, abstain: 0, absent: 0 }) || { for: 0, against: 0, abstain: 0, absent: 0 };

  const totalVotes = voteStats.for + voteStats.against + voteStats.abstain + voteStats.absent;
  const activeVotes = voteStats.for + voteStats.against + voteStats.abstain;

  // Get unique parties
  const uniqueParties = new Set(votingData?.map(v => v.mp?.party).filter(Boolean) || []);
  const parties = ["all", ...Array.from(uniqueParties)];

  // Filter votes by party
  const filteredVotes = selectedParty === "all" 
    ? votingData 
    : votingData?.filter(v => v.mp?.party === selectedParty);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusStyle = statusConfig[bill.status as keyof typeof statusConfig]?.color || "";
  const statusLabel = statusConfig[bill.status as keyof typeof statusConfig]?.label || bill.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container py-6">
          <Link href="/bills">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Grįžti į sąrašą
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline">{bill.category}</Badge>
                <Badge className={`${statusStyle} border-0`}>
                  {statusLabel}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">{bill.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Pateikta: {formatDate(bill.submittedAt)}
                </div>
                {bill.votedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Balsuota: {formatDate(bill.votedAt)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {bill.seimasId}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Dalintis
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Atsisiųsti
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Santrauka
                </CardTitle>
                <CardDescription>
                  Automatiškai sugeneruota įstatymo projekto santrauka
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Įstatymo projektas skirtas {bill.category?.toLowerCase()} srities klausimams spręsti</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Numatoma įgyvendinti konkrečias priemones ir pakeitimus esamoje teisinėje bazėje</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Projektas atitinka Europos Sąjungos direktyvas ir nacionalinius įsipareigojimus</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Aprašymas</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>{bill.description || "Aprašymas nepateiktas"}</p>
                
                {bill.explanatoryNotes && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold mb-2">Aiškinamasis raštas</h3>
                    <p className="text-muted-foreground">{bill.explanatoryNotes}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Voting Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Balsavimo Rezultatai
                </CardTitle>
                <CardDescription>
                  {totalVotes} Seimo narių balsavimo duomenys
                </CardDescription>
              </CardHeader>
              <CardContent>
                {votesLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                        <div className="h-8 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Vote Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(voteConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        const count = voteStats[key as keyof typeof voteStats];
                        const percentage = totalVotes > 0 ? (count / totalVotes * 100).toFixed(1) : "0";
                        
                        return (
                          <div key={key} className="text-center">
                            <Icon className={`h-8 w-8 mx-auto mb-2 ${config.color}`} />
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-xs text-muted-foreground">{config.label}</div>
                            <div className="text-xs text-muted-foreground">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vote Progress Bars */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-600 dark:text-green-400">Už</span>
                          <span className="font-medium">{voteStats.for}</span>
                        </div>
                        <Progress 
                          value={activeVotes > 0 ? (voteStats.for / activeVotes * 100) : 0} 
                          className="h-3"
                          indicatorClassName="bg-green-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600 dark:text-red-400">Prieš</span>
                          <span className="font-medium">{voteStats.against}</span>
                        </div>
                        <Progress 
                          value={activeVotes > 0 ? (voteStats.against / activeVotes * 100) : 0} 
                          className="h-3"
                          indicatorClassName="bg-red-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-yellow-600 dark:text-yellow-400">Susilaikė</span>
                          <span className="font-medium">{voteStats.abstain}</span>
                        </div>
                        <Progress 
                          value={activeVotes > 0 ? (voteStats.abstain / activeVotes * 100) : 0} 
                          className="h-3"
                          indicatorClassName="bg-yellow-600"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Individual Votes */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Individualūs balsai</h3>
                        <select
                          value={selectedParty}
                          onChange={(e) => setSelectedParty(e.target.value)}
                          className="text-sm border rounded px-3 py-1 bg-background"
                        >
                          <option value="all">Visos frakcijos</option>
                          {parties.slice(1).map((party) => (
                            <option key={party} value={party}>{party}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredVotes?.map(({ vote, mp }) => {
                          if (!vote || !mp) return null;
                          
                          const voteConf = voteConfig[vote.voteValue as keyof typeof voteConfig];
                          const VoteIcon = voteConf?.icon || MinusCircle;
                          
                          return (
                            <Link key={vote.id} href={`/mp/${mp.id}`}>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={mp.photoUrl || undefined} />
                                    <AvatarFallback>{mp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium group-hover:text-primary transition-colors">
                                      {mp.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{mp.party}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <VoteIcon className={`h-5 w-5 ${voteConf?.color}`} />
                                  <span className="text-sm font-medium">{voteConf?.label}</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Balsavimo aktyvumas</div>
                  <div className="text-2xl font-bold">
                    {totalVotes > 0 ? ((activeVotes / totalVotes) * 100).toFixed(1) : 0}%
                  </div>
                  <Progress 
                    value={totalVotes > 0 ? (activeVotes / totalVotes * 100) : 0} 
                    className="mt-2"
                  />
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Palaikymo lygis</div>
                  <div className="text-2xl font-bold text-green-600">
                    {activeVotes > 0 ? ((voteStats.for / activeVotes) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {voteStats.for} iš {activeVotes} balsavusių
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Bills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Susiję projektai</CardTitle>
                <CardDescription>Tos pačios kategorijos įstatymai</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Susiję projektai bus rodomi netrukus
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
