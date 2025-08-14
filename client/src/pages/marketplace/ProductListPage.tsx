import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { CartIcon } from '@/components/CartIcon';
import { useQuery } from "@tanstack/react-query";

// Sample products with images
const sampleProductsByCategory = {
  'Seeds': [
    { id: 'seeds-1', name: 'Basmati Rice Seeds', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop&crop=center', avgPrice: 2500, vendorCount: 3 },
    { id: 'seeds-2', name: 'Hybrid Tomato Seeds', image: 'https://images.unsplash.com/photo-1592841200221-c4942a7b8056?w=300&h=200&fit=crop&crop=center', avgPrice: 1200, vendorCount: 5 },
    { id: 'seeds-3', name: 'Wheat Seeds (HD-2967)', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center', avgPrice: 35, vendorCount: 4 },
    { id: 'seeds-4', name: 'Sunflower Seeds', image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=300&h=200&fit=crop&crop=center', avgPrice: 180, vendorCount: 2 },
    { id: 'seeds-5', name: 'Cotton Seeds (Bt)', image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&h=200&fit=crop&crop=center', avgPrice: 890, vendorCount: 3 },
    { id: 'seeds-6', name: 'Mustard Seeds', image: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=300&h=200&fit=crop&crop=center', avgPrice: 85, vendorCount: 4 }
  ],
  'Crops': [
    { id: 'crops-1', name: 'Fresh Basmati Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop&crop=center', avgPrice: 65, vendorCount: 6 },
    { id: 'crops-2', name: 'Organic Wheat', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center', avgPrice: 28, vendorCount: 4 },
    { id: 'crops-3', name: 'Red Onions', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=200&fit=crop&crop=center', avgPrice: 22, vendorCount: 7 },
    { id: 'crops-4', name: 'Fresh Tomatoes', image: 'https://images.unsplash.com/photo-1592841200221-c4942a7b8056?w=300&h=200&fit=crop&crop=center', avgPrice: 35, vendorCount: 5 },
    { id: 'crops-5', name: 'Green Chili', image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=300&h=200&fit=crop&crop=center', avgPrice: 45, vendorCount: 3 },
    { id: 'crops-6', name: 'Fresh Cauliflower', image: 'https://images.unsplash.com/photo-1568584711271-6c5b86277e12?w=300&h=200&fit=crop&crop=center', avgPrice: 30, vendorCount: 4 }
  ],
  'Fertilizers/Manure': [
    { id: 'fert-1', name: 'Cow Dung Manure', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&crop=center', avgPrice: 8, vendorCount: 8 },
    { id: 'fert-2', name: 'NPK Fertilizer (20:20:20)', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&crop=center', avgPrice: 1850, vendorCount: 6 },
    { id: 'fert-3', name: 'Vermicompost', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&crop=center', avgPrice: 12, vendorCount: 5 },
    { id: 'fert-4', name: 'Urea Fertilizer', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&crop=center', avgPrice: 1200, vendorCount: 4 },
    { id: 'fert-5', name: 'Bone Meal Fertilizer', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&crop=center', avgPrice: 45, vendorCount: 3 },
    { id: 'fert-6', name: 'Potash Fertilizer', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&crop=center', avgPrice: 1680, vendorCount: 2 }
  ],
  'Dairy Products': [
    { id: 'dairy-1', name: 'Fresh Buffalo Milk', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop&crop=center', avgPrice: 55, vendorCount: 10 },
    { id: 'dairy-2', name: 'Cow Milk (A2)', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop&crop=center', avgPrice: 65, vendorCount: 8 },
    { id: 'dairy-3', name: 'Fresh Paneer', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop&crop=center', avgPrice: 320, vendorCount: 6 },
    { id: 'dairy-4', name: 'Farm Butter', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=200&fit=crop&crop=center', avgPrice: 450, vendorCount: 4 },
    { id: 'dairy-5', name: 'Greek Yogurt', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop&crop=center', avgPrice: 180, vendorCount: 5 },
    { id: 'dairy-6', name: 'Fresh Cream', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop&crop=center', avgPrice: 290, vendorCount: 3 }
  ]
};

export default function ProductListPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Get category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category') || 'Seeds';
  
  const handleBack = () => {
    setLocation('/marketplace/buy');
  };

  const handleProductSelect = (productId: string, productName: string) => {
    setLocation(`/marketplace/buy/vendors?product=${productId}&name=${encodeURIComponent(productName)}`);
  };

  // Fetch marketplace products for this category
  const { data: marketplaceProducts = [] } = useQuery({
    queryKey: ['/api/marketplace/products', category],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/products?category=${category}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Get sample products for this category
  const sampleProducts = sampleProductsByCategory[category as keyof typeof sampleProductsByCategory] || [];
  
  // Convert marketplace products to the same format
  const formattedMarketplaceProducts = marketplaceProducts.map((product: any) => ({
    id: product.id,
    name: product.productName,
    image: product.imageUrls ? JSON.parse(product.imageUrls)[0] : 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center',
    avgPrice: product.pricePerUnit,
    vendorCount: 1,
    isMarketplace: true
  }));

  const allProducts = [...sampleProducts, ...formattedMarketplaceProducts];

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
              <h2 className="text-lg font-semibold">{category}</h2>
              <p className="text-sm opacity-90">{allProducts.length} products available</p>
            </div>
          </div>
          <div className="text-white">
            <CartIcon />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-4">
          {allProducts.map((product) => (
            <Card 
              key={product.id} 
              className="bg-white border border-gray-200 hover:border-ag-green transition-colors cursor-pointer overflow-hidden"
              onClick={() => handleProductSelect(product.id, product.name)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                        {product.isMarketplace && (
                          <div className="bg-ag-green text-white px-2 py-1 rounded text-xs">
                            Marketplace
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.2</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {product.vendorCount} vendor{product.vendorCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-semibold text-ag-green">₹{product.avgPrice}</span>
                          <span className="text-sm text-gray-500 ml-1">onwards</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {allProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}