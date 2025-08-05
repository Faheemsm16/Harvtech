import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Package } from "lucide-react";
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
    seller?: {
      name: string;
    };
  };
}

export default function CartPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['/api/marketplace/cart'],
    queryFn: () => apiRequest('/api/marketplace/cart'),
    enabled: !!user?.id,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return await apiRequest(`/api/marketplace/cart/items/${itemId}`, 'PUT', { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest(`/api/marketplace/cart/items/${itemId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation('/marketplace/buy');
  };

  const handleQuantityChange = (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    if (newQuantity !== currentQuantity) {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleProceedToPayment = () => {
    setLocation('/marketplace/payment');
  };

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total: number, item: CartItemWithProduct) => 
      total + (item.product.pricePerUnit * item.quantity), 0
    );
  };

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
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Please log in to view your cart</p>
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
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <p className="text-sm opacity-90">
              {cartItems?.length || 0} item{cartItems?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading cart...</div>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some products to get started!</p>
            <Button 
              onClick={() => setLocation('/marketplace/buy')}
              className="bg-ag-green hover:bg-ag-green/90 text-white"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item: CartItemWithProduct) => (
                <Card key={item.id} className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      {/* Product Image Placeholder */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product.productName}
                        </h3>
                        {item.product.seller && (
                          <p className="text-sm text-gray-600">
                            Seller: {item.product.seller.name}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-bold text-ag-green">
                            ₹{item.product.pricePerUnit}
                          </span>
                          <span className="text-sm text-gray-500">
                            per {item.product.quantityUnit}
                          </span>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₹{item.product.pricePerUnit * item.quantity}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card className="bg-white border border-gray-200 sticky bottom-4">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Subtotal</span>
                  <span className="text-ag-green">₹{calculateSubtotal()}</span>
                </div>
                
                <Button 
                  onClick={handleProceedToPayment}
                  className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 text-lg font-semibold"
                  disabled={!cartItems || cartItems.length === 0}
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}