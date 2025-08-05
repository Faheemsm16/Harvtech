import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';

export default function OrderSuccessPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleContinueShopping = () => {
    setLocation('/marketplace/buy');
  };

  const handleGoHome = () => {
    setLocation('/marketplace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Order Confirmed</h2>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="bg-white max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600">
                Thank you for your order. You will receive a confirmation SMS shortly with order details and tracking information.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">What happens next?</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ag-green rounded-full"></div>
                  <span>Order confirmation SMS sent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Seller will prepare your order</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Out for delivery notification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Order delivered</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleContinueShopping}
                className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full border-ag-green text-ag-green hover:bg-ag-green hover:text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Marketplace Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}