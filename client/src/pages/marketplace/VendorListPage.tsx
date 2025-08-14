import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, ShoppingCart, MapPin, Shield, Truck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { CartIcon } from '@/components/CartIcon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Sample vendors for different products
const sampleVendorsByProduct = {
  'seeds-1': [
    { id: 'v1', name: 'Green Valley Seeds', rating: 4.5, price: 2500, unit: 'kg', location: 'Punjab', deliveryTime: '2-3 days', minOrder: 1, verified: true },
    { id: 'v2', name: 'Premium Seeds Co.', rating: 4.3, price: 2650, unit: 'kg', location: 'Haryana', deliveryTime: '3-4 days', minOrder: 1, verified: true },
    { id: 'v3', name: 'Farm Direct Seeds', rating: 4.7, price: 2400, unit: 'kg', location: 'Uttar Pradesh', deliveryTime: '1-2 days', minOrder: 2, verified: false }
  ],
  'seeds-2': [
    { id: 'v4', name: 'Agri Solutions', rating: 4.3, price: 1200, unit: 'gm', location: 'Maharashtra', deliveryTime: '2-3 days', minOrder: 250, verified: true },
    { id: 'v5', name: 'Hybrid Seed Store', rating: 4.1, price: 1150, unit: 'gm', location: 'Karnataka', deliveryTime: '4-5 days', minOrder: 250, verified: true },
    { id: 'v6', name: 'Quality Seeds Ltd', rating: 4.6, price: 1300, unit: 'gm', location: 'Gujarat', deliveryTime: '3-4 days', minOrder: 500, verified: true },
    { id: 'v7', name: 'Local Farm Seeds', rating: 3.9, price: 1100, unit: 'gm', location: 'Rajasthan', deliveryTime: '5-6 days', minOrder: 250, verified: false },
    { id: 'v8', name: 'Tomato Specialists', rating: 4.4, price: 1250, unit: 'gm', location: 'Tamil Nadu', deliveryTime: '3-4 days', minOrder: 500, verified: true }
  ],
  'crops-1': [
    { id: 'v9', name: 'Rice Valley', rating: 4.6, price: 65, unit: 'kg', location: 'Punjab', deliveryTime: '1-2 days', minOrder: 5, verified: true },
    { id: 'v10', name: 'Basmati Direct', rating: 4.8, price: 70, unit: 'kg', location: 'Haryana', deliveryTime: '2-3 days', minOrder: 10, verified: true },
    { id: 'v11', name: 'Premium Rice Co.', rating: 4.4, price: 68, unit: 'kg', location: 'Uttar Pradesh', deliveryTime: '2-3 days', minOrder: 5, verified: true },
    { id: 'v12', name: 'Farmer Direct Rice', rating: 4.2, price: 62, unit: 'kg', location: 'Bihar', deliveryTime: '3-4 days', minOrder: 25, verified: false },
    { id: 'v13', name: 'Organic Rice Hub', rating: 4.7, price: 75, unit: 'kg', location: 'West Bengal', deliveryTime: '2-3 days', minOrder: 10, verified: true },
    { id: 'v14', name: 'Golden Grain Store', rating: 4.1, price: 63, unit: 'kg', location: 'Jharkhand', deliveryTime: '4-5 days', minOrder: 20, verified: true }
  ],
  'dairy-1': [
    { id: 'v15', name: 'Dairy Fresh', rating: 4.9, price: 55, unit: 'liter', location: 'Gujarat', deliveryTime: 'Same day', minOrder: 1, verified: true },
    { id: 'v16', name: 'Pure Milk Co.', rating: 4.8, price: 52, unit: 'liter', location: 'Rajasthan', deliveryTime: 'Same day', minOrder: 2, verified: true },
    { id: 'v17', name: 'Farm Fresh Dairy', rating: 4.7, price: 58, unit: 'liter', location: 'Punjab', deliveryTime: '1 day', minOrder: 1, verified: true },
    { id: 'v18', name: 'Village Milk Store', rating: 4.5, price: 50, unit: 'liter', location: 'Haryana', deliveryTime: 'Same day', minOrder: 5, verified: true },
    { id: 'v19', name: 'Buffalo Milk Direct', rating: 4.6, price: 56, unit: 'liter', location: 'Uttar Pradesh', deliveryTime: '1 day', minOrder: 2, verified: false },
    { id: 'v20', name: 'Premium Dairy Hub', rating: 4.4, price: 60, unit: 'liter', location: 'Maharashtra', deliveryTime: '1-2 days', minOrder: 1, verified: true },
    { id: 'v21', name: 'Local Dairy Farm', rating: 4.3, price: 48, unit: 'liter', location: 'Madhya Pradesh', deliveryTime: '2 days', minOrder: 10, verified: false },
    { id: 'v22', name: 'Quality Milk Store', rating: 4.8, price: 57, unit: 'liter', location: 'Rajasthan', deliveryTime: 'Same day', minOrder: 3, verified: true },
    { id: 'v23', name: 'Fresh Dairy Express', rating: 4.2, price: 53, unit: 'liter', location: 'Gujarat', deliveryTime: 'Same day', minOrder: 2, verified: true },
    { id: 'v24', name: 'Organic Dairy Co.', rating: 4.9, price: 65, unit: 'liter', location: 'Kerala', deliveryTime: '1-2 days', minOrder: 1, verified: true }
  ]
};

export default function VendorListPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  
  // Get product info from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product') || 'seeds-1';
  const productName = decodeURIComponent(urlParams.get('name') || 'Product');
  
  const handleBack = () => {
    window.history.back();
  };

  // Get vendors for this product
  const vendors = sampleVendorsByProduct[productId as keyof typeof sampleVendorsByProduct] || [];
  
  // Sort vendors by price (lowest first)
  const sortedVendors = [...vendors].sort((a, b) => a.price - b.price);

  const getQuantity = (vendorId: string, minOrder: number) => {
    return quantities[vendorId] || minOrder;
  };

  const updateQuantity = (vendorId: string, change: number, minOrder: number) => {
    setQuantities(prev => {
      const currentQty = prev[vendorId] || minOrder;
      const newQty = Math.max(minOrder, currentQty + change);
      return { ...prev, [vendorId]: newQty };
    });
  };

  // Mutation to create an order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest('/api/marketplace/orders', 'POST', orderData);
    },
    onSuccess: (data) => {
      toast({
        title: "Order Created Successfully!",
        description: `Order #${data.orderNumber} has been placed. You can track it in My Orders.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/orders'] });
      setLocation('/my-orders');
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = async (vendor: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to make a purchase",
        variant: "destructive",
      });
      return;
    }

    const quantity = getQuantity(vendor.id, vendor.minOrder);
    const totalAmount = vendor.price * quantity;
    
    // Create order with delivery details
    const orderData = {
      userId: user.id,
      orderNumber: `ORD${Date.now()}`,
      totalAmount: totalAmount * 100, // Convert to paise
      deliveryFee: 5000, // ₹50 in paise
      paymentMethod: 'cod', // Default to COD
      deliveryName: user.name || 'Customer',
      deliveryMobile: user.mobileNumber || '9999999999',
      deliveryAddress: `${user.city || 'City'}, Address Line`,
      deliveryCity: user.city || 'City',
      deliveryState: 'State',
      deliveryPincode: '123456',
      items: [{
        productName: productName,
        vendorName: vendor.name,
        quantity: quantity,
        unit: vendor.unit,
        pricePerUnit: vendor.price,
        subtotal: totalAmount
      }]
    };

    createOrderMutation.mutate(orderData);
  };

  if (vendors.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-ag-green text-white p-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{productName}</h2>
              <p className="text-sm opacity-90">No vendors available</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No vendors found for this product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{productName}</h2>
              <p className="text-sm opacity-90">{vendors.length} vendors available</p>
            </div>
          </div>
          <div className="text-white">
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Price Range Info */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Price range:</span>
          <span className="font-semibold text-ag-green">
            ₹{Math.min(...vendors.map(v => v.price))} - ₹{Math.max(...vendors.map(v => v.price))}
          </span>
        </div>
      </div>
      
      {/* Vendors List */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {sortedVendors.map((vendor, index) => {
            const quantity = getQuantity(vendor.id, vendor.minOrder);
            const totalPrice = vendor.price * quantity;
            const isLowestPrice = index === 0;
            
            return (
              <Card key={vendor.id} className={`bg-white overflow-hidden ${isLowestPrice ? 'border-ag-green ring-1 ring-ag-green' : 'border-gray-200'}`}>
                <CardContent className="p-0">
                  {isLowestPrice && (
                    <div className="bg-ag-green text-white text-xs py-1 px-4 font-medium">
                      Best Price
                    </div>
                  )}
                  
                  <div className="p-4">
                    {/* Vendor Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{vendor.name}</h3>
                          {vendor.verified && (
                            <Shield className="h-4 w-4 text-green-600" title="Verified Seller" />
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{vendor.rating}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Truck className="h-3 w-3 mr-1" />
                            {vendor.deliveryTime}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and Quantity */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="text-2xl font-bold text-ag-green">₹{vendor.price}</span>
                          <span className="text-sm text-gray-500 ml-1">per {vendor.unit}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Min order: {vendor.minOrder} {vendor.unit}</div>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(vendor.id, -1, vendor.minOrder)}
                            disabled={quantity <= vendor.minOrder}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="min-w-[60px] text-center font-medium">
                            {quantity} {vendor.unit}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(vendor.id, 1, vendor.minOrder)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      
                      {/* Total and Purchase */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Total: </span>
                          <span className="text-lg font-bold text-ag-green">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <Button 
                          onClick={() => handlePurchase(vendor)}
                          disabled={createOrderMutation.isPending}
                          className="bg-ag-green hover:bg-ag-green/90 text-white flex items-center space-x-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>{createOrderMutation.isPending ? 'Processing...' : 'Buy Now'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}