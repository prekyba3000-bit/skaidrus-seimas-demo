import { useState, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// Initial load critical path
import Home from "./pages/Home";

// Lazy load heavy routes
const Bills = lazy(() => import("./pages/Bills"));
const BillDetail = lazy(() => import("./pages/BillDetail"));
const MPProfile = lazy(() => import("./pages/MPProfile"));
const MPs = lazy(() => import("./pages/MPs"));
const MpCompare = lazy(() => import("./pages/MpCompare"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Pulsas = lazy(() => import("./pages/Pulsas"));
const Settings = lazy(() => import("./pages/Settings"));
const Committees = lazy(() => import("./pages/Committees"));
const CommitteeDetail = lazy(() => import("./pages/CommitteeDetail"));
const Coalitions = lazy(() => import("./pages/Coalitions"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700 shadow-lg shadow-black/40">
        <Loader2 className="text-primary text-3xl drop-shadow-[0_0_8px_rgba(245,159,10,0.6)] animate-spin" />
      </div>
      <p className="text-emerald-400/70 text-sm font-medium animate-pulse">
        Kraunama...
      </p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/bills"} component={Bills} />
        <Route path={"/bills/:id"} component={BillDetail} />
        <Route path={"/mps"} component={MPs} />
        <Route path={"/compare"} component={MpCompare} />
        <Route path={"/mp/:id"} component={MPProfile} />
        <Route path={"/committees"} component={Committees} />
        <Route path={"/committees/:id"} component={CommitteeDetail} />
        <Route path={"/pulse"} component={Pulsas} />
        <Route path={"/coalitions"} component={Coalitions} />
        <Route path={"/nustatymai"} component={Settings} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  console.log("[DEBUG] App.tsx: Component rendering");
  
  const [queryClient] = useState(() => {
    console.log("[DEBUG] App.tsx: Creating QueryClient");
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          // Don't fail the entire app if a query fails
          onError: (error) => {
            console.error("[DEBUG] App.tsx: Query error:", error);
          },
        },
      },
    });
  });
  
  const [trpcClient] = useState(() => {
    console.log("[DEBUG] App.tsx: Creating tRPC client");
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    });
  });

  console.log("[DEBUG] App.tsx: About to render providers");

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider
            defaultTheme="dark"
            // switchable
          >
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
