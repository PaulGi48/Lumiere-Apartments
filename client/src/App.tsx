import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Route-level chunks keep dashboards and their charting dependencies out of
// the initial customer-facing download.
const HomePage = lazy(() => import("@/pages/home"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ApartmentDetails = lazy(() => import("@/pages/apartment-details"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const SupportDashboard = lazy(() => import("@/pages/support-dashboard"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const NotFound = lazy(() => import("@/pages/not-found"));
import { AppErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/apartments/:id" component={ApartmentDetails} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/support" component={SupportDashboard} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RouteLoading() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f5ef] text-[#202a3a]"
      aria-live="polite"
      aria-busy="true"
    >
      <img src="/media/LUMIERE%20LOGO.png" alt="Lumiere Apartments" className="h-16 w-auto object-contain" />
      <Loader2 className="h-6 w-6 animate-spin text-[#9a7950]" aria-hidden="true" />
      <p className="text-sm tracking-wide text-[#667085]">Loading your page…</p>
    </main>
  );
}

import { PreloadPage } from "@/components/preload-page";

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PreloadPage>
              <TooltipProvider>
                <Toaster />
                <Suspense fallback={<RouteLoading />}>
                  <Router />
                </Suspense>
              </TooltipProvider>
            </PreloadPage>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
