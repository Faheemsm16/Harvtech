import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useCustomAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import NotFound from "@/pages/not-found";
import EntryPage from "@/pages/EntryPage";
import LoginPage from "@/pages/LoginPage";
import RoleSelectionPage from "@/pages/RoleSelectionPage";
import UserRegistrationPage from "@/pages/UserRegistrationPage";
import OwnerRegistrationPage from "@/pages/OwnerRegistrationPage";
import UserDashboard from "@/pages/UserDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import PlatformsPage from "@/pages/PlatformsPage";
import GovernmentSchemesPage from "@/pages/GovernmentSchemesPage";
import MarketPlacePage from "@/pages/MarketPlacePage";
import InsuranceFinanceForm from "@/pages/InsuranceFinanceForm";
import TransportBookingPage from "@/pages/TransportBookingPage";
import TransportVehicleSelectionPage from "@/pages/TransportVehicleSelectionPage";
import TransportPaymentPage from "@/pages/TransportPaymentPage";
import WarehousePage from "@/pages/WarehousePage";
import EquipmentListPage from "@/pages/EquipmentListPage";
import PaymentPage from "@/pages/PaymentPage";
import SellCategoryPage from "@/pages/marketplace/SellCategoryPage";
import ProductUploadPage from "@/pages/marketplace/ProductUploadPage";
import BuyCategoryPage from "@/pages/marketplace/BuyCategoryPage";
import ProductBrowsePage from "@/pages/marketplace/ProductBrowsePage";
import SimpleCartPage from "@/pages/marketplace/SimpleCartPage";
import CheckoutPage from "@/pages/marketplace/CheckoutPage";
import OrderSuccessPage from "@/pages/marketplace/OrderSuccessPage";
import MarketplacePaymentPage from "@/pages/marketplace/PaymentPage";

function Router() {
  const { isAuthenticated, isLoading } = useCustomAuth();

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
          <Route path="/platforms" component={PlatformsPage} />
          <Route path="/government-schemes" component={GovernmentSchemesPage} />
          <Route path="/marketplace" component={MarketPlacePage} />
          <Route path="/insurance-finance" component={InsuranceFinanceForm} />
          <Route path="/transport-booking" component={TransportBookingPage} />
          <Route path="/transport-vehicle-selection" component={TransportVehicleSelectionPage} />
          <Route path="/transport-payment" component={TransportPaymentPage} />
          <Route path="/warehouse" component={WarehousePage} />
          <Route path="/equipment/:type" component={EquipmentListPage} />
          <Route path="/payment/:equipmentId" component={PaymentPage} />
          <Route path="/marketplace/sell" component={SellCategoryPage} />
          <Route path="/marketplace/sell/upload" component={ProductUploadPage} />
          <Route path="/marketplace/buy" component={BuyCategoryPage} />
          <Route path="/marketplace/buy/browse" component={ProductBrowsePage} />
          <Route path="/marketplace/cart" component={SimpleCartPage} />
          <Route path="/marketplace/checkout" component={CheckoutPage} />
          <Route path="/marketplace/order-success" component={OrderSuccessPage} />
          <Route path="/marketplace/payment" component={MarketplacePaymentPage} />
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
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden">
                <Toaster />
                <Router />
              </div>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
