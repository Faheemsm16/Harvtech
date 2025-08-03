import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import EntryPage from "@/pages/EntryPage";
import LoginPage from "@/pages/LoginPage";
import RoleSelectionPage from "@/pages/RoleSelectionPage";
import UserRegistrationPage from "@/pages/UserRegistrationPage";
import OwnerRegistrationPage from "@/pages/OwnerRegistrationPage";
import UserDashboard from "@/pages/UserDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import EquipmentListPage from "@/pages/EquipmentListPage";
import PaymentPage from "@/pages/PaymentPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={EntryPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/role-selection" component={RoleSelectionPage} />
      <Route path="/user-registration" component={UserRegistrationPage} />
      <Route path="/owner-registration" component={OwnerRegistrationPage} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          <Route path="/user-dashboard" component={UserDashboard} />
          <Route path="/owner-dashboard" component={OwnerDashboard} />
          <Route path="/equipment/:type" component={EquipmentListPage} />
          <Route path="/payment/:equipmentId" component={PaymentPage} />
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden">
            <Toaster />
            <Router />
          </div>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
