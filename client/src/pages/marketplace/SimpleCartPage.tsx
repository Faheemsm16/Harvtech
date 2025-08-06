import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';

export default function SimpleCartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart, formatUnit } = useCart();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/marketplace/buy');
  };

  const handleCheckout = () => {
    setLocation('/marketplace/checkout');
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
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
            <h2 className="text-lg font-semibold">{t('cart')}</h2>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
            <Button 
              onClick={handleBack}
              className="bg-ag-green hover:bg-ag-green/90 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-lg font-semibold">{t('cart')} ({items.length} items)</h2>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="bg-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{t('by_seller')} {item.seller}</p>
                  <p className="text-lg font-semibold text-ag-green mt-1">₹{item.price} per {item.unit}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="px-3 text-center">
                    <span className="font-medium">{formatUnit(item.quantity, item.unit)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Order Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹50</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>{t('total')}</span>
                <span>₹{totalPrice + 50}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}