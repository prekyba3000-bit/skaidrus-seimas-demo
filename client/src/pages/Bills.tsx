import { useState } from "react";
import { Link } from "wouter";
import { Search, Filter, Calendar, FileText, TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const statusConfig = {
  proposed: { label: "Pateiktas", icon: Clock, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  voted: { label: "Balsuota", icon: AlertCircle, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  passed: { label: "Priimtas", icon: CheckCircle2, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  rejected: { label: "Atmestas", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const categories = [
  "Visi",
  "Švietimas",
  "Sveikata",
  "Ekonomika",
  "Aplinka",
  "Socialinė apsauga",
  "Teisingumo",
];

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Visi");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch bills with filters
  const { data: bills, isLoading } = trpc.bills.list.useQuery({
    category: selectedCategory !== "Visi" ? selectedCategory : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  // Filter bills by search term
  const filteredBills = bills?.filter(bill =>
    bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group bills by status
  const billsByStatus = {
    all: filteredBills,
    proposed: filteredBills.filter(b => b.status === "proposed"),
    voted: filteredBills.filter(b => b.status === "voted"),
    passed: filteredBills.filter(b => b.status === "passed"),
    rejected: filteredBills.filter(b => b.status === "rejected"),
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Įstatymų Projektai</h1>
              <p className="text-muted-foreground">
                Naršykite ir sekite Seimo svarstomą įstatymų leidybą
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Populiariausi
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ieškoti įstatymų projektų..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all">
              Visi ({billsByStatus.all.length})
            </TabsTrigger>
            <TabsTrigger value="proposed">
              Pateikti ({billsByStatus.proposed.length})
            </TabsTrigger>
            <TabsTrigger value="voted">
              Balsuoti ({billsByStatus.voted.length})
            </TabsTrigger>
            <TabsTrigger value="passed">
              Priimti ({billsByStatus.passed.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Atmesti ({billsByStatus.rejected.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <TabsContent value={selectedStatus} className="mt-0">
              {filteredBills.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Įstatymų projektų nerasta</p>
                    <p className="text-sm text-muted-foreground">
                      Pabandykite pakeisti filtrus arba paieškos kriterijus
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBills.map((bill) => {
                    const StatusIcon = statusConfig[bill.status as keyof typeof statusConfig]?.icon || FileText;
                    const statusStyle = statusConfig[bill.status as keyof typeof statusConfig]?.color || "";
                    const statusLabel = statusConfig[bill.status as keyof typeof statusConfig]?.label || bill.status;

                    return (
                      <Link key={bill.id} href={`/bills/${bill.id}`}>
                        <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {bill.category}
                              </Badge>
                              <Badge className={`${statusStyle} border-0`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusLabel}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {bill.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs">
                              <Calendar className="h-3 w-3" />
                              {formatDate(bill.submittedAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {bill.description || "Aprašymas nepateiktas"}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
