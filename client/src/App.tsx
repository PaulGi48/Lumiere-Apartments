import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import HomePage from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import ApartmentDetails from "@/pages/apartment-details";
import ProfilePage from "@/pages/profile";
import AdminDashboard from "@/pages/admin-dashboard";
import SupportDashboard from "@/pages/support-dashboard";
import TermsPage from "@/pages/terms-page";
import { AppErrorBoundary } from "@/components/error-boundary";

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
      <Route component={NotFound} />
    </Switch>
  );
}

import { PreloadPage } from "@/components/preload-page";

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PreloadPage>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </PreloadPage>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
