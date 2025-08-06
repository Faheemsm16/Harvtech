import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, CreditCard, Truck } from "lucide-react";
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, formatUnit } = useCart();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    setLocation('/marketplace/cart');
  };

  const totalPrice = getTotalPrice();
  const deliveryFee = 50;
  const finalTotal = totalPrice + deliveryFee;

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlaceOrder = async () => {
    // Validate required fields
    const requiredFields = ['fullName', 'mobile', 'address', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !deliveryAddress[field as keyof typeof deliveryAddress]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required delivery address fields",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(deliveryAddress.mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{6}$/.test(deliveryAddress.pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order of ₹${finalTotal} has been confirmed. You will receive a confirmation SMS shortly.`,
      });
      setLocation('/marketplace/order-success');
      setIsProcessing(false);
    }, 2000);
  };

  if (items.length === 0) {
    setLocation('/marketplace/cart');
    return null;
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
            <h2 className="text-lg font-semibold">Checkout</h2>
            <p className="text-sm opacity-90">Complete your order</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Delivery Address */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-ag-green" />
              <span>Delivery Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={deliveryAddress.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={deliveryAddress.mobile}
                  onChange={(e) => handleAddressChange('mobile', e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  placeholder="House no., Building name, Street name"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={deliveryAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={deliveryAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="Enter 6-digit pincode"
                  />
                </div>
                
                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={deliveryAddress.landmark}
                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                    placeholder="Near landmark"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-ag-green" />
              <span>Payment Method</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">UPI</span>
                    </div>
                    <div>
                      <p className="font-medium">UPI Payment</p>
                      <p className="text-sm text-gray-500">Pay via PhonePe, GPay, Paytm, etc.</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive the order</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {formatUnit(item.quantity, item.unit)} × ₹{item.price} per {item.unit}</p>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-ag-green">₹{finalTotal}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full mt-6 bg-ag-green hover:bg-ag-green/90 text-white py-3"
            >
              {isProcessing ? 'Processing...' : `Place Order - ₹${finalTotal}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}