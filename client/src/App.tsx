import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
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
import InsuranceFinancePage from "@/pages/InsuranceFinancePage";
import TransportBookingPage from "@/pages/TransportBookingPage";
import TransportVehicleSelectionPage from "@/pages/TransportVehicleSelectionPage";
import TransportPaymentPage from "@/pages/TransportPaymentPage";
import WarehousePage from "@/pages/WarehousePage";
import EquipmentListPage from "@/pages/EquipmentListPage";
import PaymentPage from "@/pages/PaymentPage";
import FieldMappingPage from "@/pages/FieldMappingPage";
import SavedFieldsPage from "@/pages/SavedFieldsPage";
import FieldAnalyticsPage from "@/pages/FieldAnalyticsPage";
import WeatherAnalysisPage from "@/pages/WeatherAnalysisPage";
import WeatherForecastPage from "@/pages/WeatherForecastPage";
import WeatherAnalysisHistoryPage from "@/pages/WeatherAnalysisHistoryPage";
import SellCategoryPage from "@/pages/marketplace/SellCategoryPage";
import ProductUploadPage from "@/pages/marketplace/ProductUploadPage";
import BuyCategoryPage from "@/pages/marketplace/BuyCategoryPage";
import ProductListPage from "@/pages/marketplace/ProductListPage";
import VendorListPage from "@/pages/marketplace/VendorListPage";
import ProductBrowsePage from "@/pages/marketplace/ProductBrowsePage";
import SimpleCartPage from "@/pages/marketplace/SimpleCartPage";
import CheckoutPage from "@/pages/marketplace/CheckoutPage";
import OrderSuccessPage from "@/pages/marketplace/OrderSuccessPage";
import MarketplacePaymentPage from "@/pages/marketplace/PaymentPage";
import MyOrdersPage from "@/pages/MyOrdersPage";
import MyProductsPage from "@/pages/marketplace/MyProductsPage";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ag-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      {!isAuthenticated && <Route path="/" component={EntryPage} />}
      <Route path="/login" component={LoginPage} />
      <Route path="/role-selection" component={RoleSelectionPage} />
      <Route path="/user-registration" component={UserRegistrationPage} />
      <Route path="/owner-registration" component={OwnerRegistrationPage} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          {/* Redirect authenticated users to appropriate dashboard */}
          <Route path="/">
            {user?.role === 'owner' ? <OwnerDashboard /> : <UserDashboard />}
          </Route>
          <Route path="/user-dashboard" component={UserDashboard} />
          <Route path="/owner-dashboard" component={OwnerDashboard} />
          <Route path="/my-orders" component={MyOrdersPage} />
          <Route path="/platforms" component={PlatformsPage} />
          <Route path="/government-schemes" component={GovernmentSchemesPage} />
          <Route path="/marketplace" component={MarketPlacePage} />
          <Route path="/insurance-finance" component={InsuranceFinancePage} />
          <Route path="/insurance-finance/form" component={InsuranceFinanceForm} />
          <Route path="/transport-booking" component={TransportBookingPage} />
          <Route path="/transport-vehicle-selection" component={TransportVehicleSelectionPage} />
          <Route path="/transport-payment" component={TransportPaymentPage} />
          <Route path="/warehouse" component={WarehousePage} />
          <Route path="/equipment/:type" component={EquipmentListPage} />
          <Route path="/payment/:equipmentId" component={PaymentPage} />
          <Route path="/services" component={FieldMappingPage} />
          <Route path="/services/fields" component={SavedFieldsPage} />
          <Route path="/services/analytics/:id" component={FieldAnalyticsPage} />
          <Route path="/services/weather/:id" component={WeatherAnalysisPage} />
          <Route path="/services/weather/:id/forecast" component={WeatherForecastPage} />
          <Route path="/services/weather/:id/analysis" component={WeatherAnalysisHistoryPage} />
          <Route path="/marketplace/sell" component={SellCategoryPage} />
          <Route path="/marketplace/sell/upload" component={ProductUploadPage} />
          <Route path="/marketplace/buy" component={BuyCategoryPage} />
          <Route path="/marketplace/buy/products" component={ProductListPage} />
          <Route path="/marketplace/buy/vendors" component={VendorListPage} />
          <Route path="/marketplace/buy/browse" component={ProductBrowsePage} />
          <Route path="/marketplace/cart" component={SimpleCartPage} />
          <Route path="/marketplace/checkout" component={CheckoutPage} />
          <Route path="/marketplace/order-success" component={OrderSuccessPage} />
          <Route path="/marketplace/payment" component={MarketplacePaymentPage} />
          <Route path="/marketplace/my-products" component={MyProductsPage} />
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
          <CartProvider>
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden">
              <Toaster />
              <Router />
            </div>
          </CartProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
