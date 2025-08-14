import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { CartIcon } from '@/components/CartIcon';

// Category definitions for marketplace
const categories = [
  {
    id: 'Seeds',
    name: 'Seeds',
    description: 'High quality crop seeds and planting materials for all seasons',
    icon: Sprout,
    color: 'green',
    productCount: '50+ varieties'
  },
  {
    id: 'Crops',
    name: 'Crops',
    description: 'Fresh harvested crops, grains and vegetables',
    icon: Wheat,
    color: 'yellow',
    productCount: '100+ products'
  },
  {
    id: 'Fertilizers/Manure',
    name: 'Fertilizers/Manure',
    description: 'Organic fertilizers, manure and soil enhancers',
    icon: Package,
    color: 'blue',
    productCount: '40+ types'
  },
  {
    id: 'Dairy Products',
    name: 'Dairy Products',
    description: 'Fresh milk, cheese, butter and dairy products',
    icon: Milk,
    color: 'purple',
    productCount: '25+ items'
  }
];

export default function BuyCategoryPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/buy/products?category=${categoryId}`);
  };

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
              <h2 className="text-lg font-semibold">{t('buy')} {t('marketplace')}</h2>
              <p className="text-sm opacity-90">Select a category to browse products</p>
            </div>
          </div>
          <div className="text-white">
            <CartIcon />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Card 
                key={category.id} 
                className="bg-white border border-gray-200 hover:border-ag-green transition-colors cursor-pointer"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-8 w-8 text-${category.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <p className="text-xs text-ag-green font-medium mt-2">{category.productCount}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400" />
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