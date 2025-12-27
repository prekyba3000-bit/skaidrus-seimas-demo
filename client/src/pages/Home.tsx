import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Share2, 
  Heart, 
  Download,
  Calendar,
  ExternalLink,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  StatisticsCard, 
  AccountabilityScore, 
  VotingBreakdownChart, 
  LegislativeActivity 
} from "@/components/DemoComponents";
import { DistrictMap } from "@/components/DistrictMap";
import { mockMp, mockStats, mockVotes } from "@/lib/mock-data";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate voting breakdown
  const votingBreakdown = mockVotes.reduce(
    (acc, vote) => {
      if (vote.voteValue === 'for') acc.votesFor++;
      else if (vote.voteValue === 'against') acc.votesAgainst++;
      else if (vote.voteValue === 'abstain') acc.abstentions++;
      else if (vote.voteValue === 'absent') acc.absences++;
      return acc;
    },
    { votesFor: 0, votesAgainst: 0, abstentions: 0, absences: 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground animate-pulse">Įkeliama Seimo nario informacija...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Top Navigation Bar (Mock) */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
              SS
            </div>
            Skaidrus Seimas
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-primary">Seimo Nariai</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Balsavimai</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Žemėlapis</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Apie Projektą</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Prisijungti</Button>
            <Button size="sm">Registruotis</Button>
          </div>
        </div>
      </header>

      {/* Profile Header Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 to-accent/10 pt-8 pb-12">
        <div className="container">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Grįžti į Sąrašą
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={mockMp.photoUrl}
                    alt={mockMp.name}
                    className="relative w-40 h-40 rounded-full object-cover border-4 border-background shadow-xl"
                  />
                  <Badge className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 border-2 border-white">
                    Aktyvus
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">{mockMp.name}</h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
                        {mockMp.party}
                      </Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {mockMp.faction}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-background/50 transition-colors">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{mockMp.district} apygarda ({mockMp.districtNumber})</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-background/50 transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${mockMp.email}`} className="hover:text-primary hover:underline">
                        {mockMp.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-background/50 transition-colors">
                      <Phone className="h-4 w-4 text-primary" />
                      <a href={`tel:${mockMp.phone}`} className="hover:text-primary hover:underline">
                        {mockMp.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-background/50 transition-colors">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Kadencija: 2024-2028</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-primary/10 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Veiksmai</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start text-base" 
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFollowing ? 'Jūs sekate šį narį' : 'Sekti veiklos ataskaitas'}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="mr-2 h-4 w-4" />
                      Dalintis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Ataskaita
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Oficialus puslapis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-10">
        <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-xl grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="overview">Apžvalga</TabsTrigger>
            <TabsTrigger value="votes">Balsavimai</TabsTrigger>
            <TabsTrigger value="map">Apygarda</TabsTrigger>
            <TabsTrigger value="biography">Biografija</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Veiklos Statistika</h2>
                <p className="text-muted-foreground mt-1">
                  Duomenys atnaujinti: {new Date(mockStats.lastCalculated).toLocaleDateString('lt-LT')}
                </p>
              </div>
              <Badge variant="outline" className="hidden sm:flex gap-1 px-3 py-1">
                <Info className="h-3 w-3" />
                Metodologija
              </Badge>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Accountability Score - Featured */}
              <div className="lg:col-span-1 h-full">
                <AccountabilityScore
                  score={parseFloat(mockStats.accountabilityScore)}
                  votingAttendance={parseFloat(mockStats.votingAttendance)}
                  partyLoyalty={parseFloat(mockStats.partyLoyalty)}
                  accountabilityFlags={0}
                />
              </div>

              {/* Key Metrics */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatisticsCard
                  title="Balsavimo Dalyvavimas"
                  value={parseFloat(mockStats.votingAttendance)}
                  unit="%"
                  description="Aukštas dalyvavimo rodiklis"
                  tooltip="Procentas balsavimų, kuriuose narys dalyvavo (nebuvo pažymėtas kaip nedalyvavęs)"
                  showProgress={true}
                  trend="up"
                />
                <StatisticsCard
                  title="Partijos Lojalumas"
                  value={parseFloat(mockStats.partyLoyalty)}
                  unit="%"
                  description="Griežtai laikosi partijos linijos"
                  tooltip="Procentas balsavimų, kuriuose narys balsavo kartu su partijos dauguma"
                  showProgress={true}
                  trend="neutral"
                />
              </div>
            </div>

            {/* Detailed Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VotingBreakdownChart
                votesFor={votingBreakdown.votesFor}
                votesAgainst={votingBreakdown.votesAgainst}
                abstentions={votingBreakdown.abstentions}
                absences={votingBreakdown.absences}
                totalVotes={mockVotes.length}
              />
              <LegislativeActivity
                billsProposed={mockStats.billsProposed}
                billsPassed={mockStats.billsPassed}
              />
            </div>
          </TabsContent>

          <TabsContent value="map" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DistrictMap 
                  districtName={mockMp.district} 
                  districtNumber={mockMp.districtNumber} 
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Apygardos Informacija</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Rinkėjų skaičius</span>
                      <span className="font-medium">34,521</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Apylinkių skaičius</span>
                      <span className="font-medium">14</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Aktyvumas (I turas)</span>
                      <span className="font-medium">58.4%</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Aktyvumas (II turas)</span>
                      <span className="font-medium">42.1%</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Kontaktinė Informacija</CardTitle>
                    <CardDescription>Apygardos būstinė</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Antakalnio g. 17</p>
                        <p className="text-muted-foreground">Vilnius, LT-10312</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <p>+370 5 234 5678</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p>I-IV 8:00-17:00, V 8:00-15:45</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="votes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Paskutiniai Balsavimai</CardTitle>
                <CardDescription>
                  50 naujausių balsavimų išklotinė
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVotes.slice(0, 10).map((vote, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            #{vote.billId}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(vote.votedAt).toLocaleDateString('lt-LT')}
                          </span>
                        </div>
                        <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                          {vote.billTitle}
                        </p>
                      </div>
                      <Badge
                        className={
                          vote.voteValue === 'for'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                            : vote.voteValue === 'against'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                            : vote.voteValue === 'abstain'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'
                        }
                      >
                        {vote.voteValue === 'for'
                          ? 'Už'
                          : vote.voteValue === 'against'
                          ? 'Prieš'
                          : vote.voteValue === 'abstain'
                          ? 'Susilaikė'
                          : 'Nedalyvavo'}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    Rodyti daugiau balsavimų
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biography" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Biografija</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <p className="leading-relaxed text-lg text-muted-foreground">
                    {mockMp.biography}
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Išsilavinimas</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>1996 m. Vilniaus universitetas, Ekonomikos fakultetas, verslo administravimo ir vadybos bakalauras.</li>
                    <li>1998 m. Vilniaus universitetas, Ekonomikos fakultetas, finansų magistras.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-6 mb-3">Darbo patirtis</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>1997–2001 m. Finansų ministerija, Mokesčių departamentas, Fiskalinės politikos departamentas.</li>
                    <li>2004–2009 m. Finansų ministerijos sekretorė.</li>
                    <li>2009–2012 m. Lietuvos Respublikos finansų ministrė.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
