import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Smartphone, Wallet, Truck, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartItemWithProduct {
  id: string;
  buyerId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    productName: string;
    pricePerUnit: number;
    quantityUnit: string;
    category: string;
    sellerId: string;
    imageUrls?: string;
  };
}

const paymentMethods = [
  {
    id: 'UPI',
    name: 'UPI',
    description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
    icon: Smartphone,
  },
  {
    id: 'Debit Card',
    name: 'Debit Card',
    description: 'Pay using your debit card',
    icon: CreditCard,
  },
  {
    id: 'Wallet',
    name: 'Wallet',
    description: 'Pay using digital wallet',
    icon: Wallet,
  },
  {
    id: 'COD',
    name: 'Cash on Delivery',
    description: 'Pay when you receive the order',
    icon: Truck,
  },
];

export default function PaymentPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['/api/marketplace/cart'],
    queryFn: () => apiRequest('/api/marketplace/cart'),
    enabled: !!user?.id,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      return await apiRequest('/api/marketplace/orders', 'POST', { paymentMethod });
    },
    onSuccess: (data) => {
      setOrderId(data.id);
      setOrderSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/orders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleBack = () => {
    setLocation('/marketplace/cart');
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total: number, item: CartItemWithProduct) => 
      total + (item.product.pricePerUnit * item.quantity), 0
    );
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      createOrderMutation.mutate(selectedPaymentMethod);
    }, 2000);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-ag-green text-white p-6">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-lg font-semibold">Order Confirmation</h2>
              <p className="text-sm opacity-90">Your order has been placed successfully</p>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 text-center mb-4">
            Thank you for your order. Your items will be delivered soon.
          </p>
          
          <Card className="w-full max-w-md mb-6">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{selectedPaymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span>3-5 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            onClick={() => setLocation('/marketplace')}
            className="bg-ag-green hover:bg-ag-green/90 text-white px-8 py-3"
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
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
              <h2 className="text-lg font-semibold">Payment</h2>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Please log in to proceed with payment</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-sm opacity-90">Choose your payment method</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading order details...</div>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No items in cart</p>
            <Button 
              onClick={() => setLocation('/marketplace/buy')}
              className="mt-4 bg-ag-green hover:bg-ag-green/90 text-white"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cartItems.map((item: CartItemWithProduct) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ₹{item.product.pricePerUnit}
                        </p>
                      </div>
                      <div className="font-medium">
                        ₹{item.product.pricePerUnit * item.quantity}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-ag-green">₹{calculateTotal()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={selectedPaymentMethod} 
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-4"
                >
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="font-medium cursor-pointer">
                            {method.name}
                          </Label>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button 
              onClick={handlePlaceOrder}
              disabled={isProcessing || !selectedPaymentMethod}
              className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 text-lg font-semibold"
            >
              {isProcessing ? "Processing..." : `Place Order - ₹${calculateTotal()}`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}