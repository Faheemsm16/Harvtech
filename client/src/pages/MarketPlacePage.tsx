import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Truck, Warehouse, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

export default function MarketPlacePage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/platforms');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Market Place</h2>
            <p className="text-sm opacity-90">Choose a service to explore</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Transport */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
              onClick={() => setLocation('/transport-booking')}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900">Transport</h3>
                <p className="text-sm text-gray-600">Book vehicles for transporting goods</p>
              </div>
              <div className="ml-auto text-gray-400">→</div>
            </Button>
          </CardContent>
        </Card>

        {/* Warehouse */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
              onClick={() => {
                // TODO: Navigate to Warehouse page when implemented
                console.log('Navigate to Warehouse');
              }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900">Warehouse</h3>
                <p className="text-sm text-gray-600">Find storage solutions for your crops</p>
              </div>
              <div className="ml-auto text-gray-400">→</div>
            </Button>
          </CardContent>
        </Card>

        {/* Buy and Sell */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
              onClick={() => {
                // TODO: Navigate to Buy and Sell page when implemented
                console.log('Navigate to Buy and Sell');
              }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900">Buy and Sell</h3>
                <p className="text-sm text-gray-600">Trade agricultural products and equipment</p>
              </div>
              <div className="ml-auto text-gray-400">→</div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}