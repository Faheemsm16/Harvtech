import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk, ShoppingCart, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useCart } from '@/context/CartContext';
import { CartIcon } from '@/components/CartIcon';
import { useToast } from '@/hooks/use-toast';

// Sample products for each category with extended data for "View All"
const sampleProducts = {
  seeds: [
    { id: 'seeds-1', name: 'Basmati Rice Seeds', price: 2500, rating: 4.5, seller: 'Green Valley Seeds', category: 'seeds' },
    { id: 'seeds-2', name: 'Hybrid Tomato Seeds', price: 1200, rating: 4.3, seller: 'Agri Solutions', category: 'seeds' },
    { id: 'seeds-3', name: 'Wheat Seeds (HD-2967)', price: 35, rating: 4.7, seller: 'Farm Direct', category: 'seeds' },
    { id: 'seeds-4', name: 'Sunflower Seeds', price: 180, rating: 4.2, seller: 'Sunny Farms', category: 'seeds' },
    // Additional products for "View All"
    { id: 'seeds-5', name: 'Cotton Seeds (Bt)', price: 890, rating: 4.4, seller: 'Cotton Kings', category: 'seeds' },
    { id: 'seeds-6', name: 'Mustard Seeds', price: 85, rating: 4.1, seller: 'Oil Seeds Co.', category: 'seeds' },
    { id: 'seeds-7', name: 'Corn Seeds (Hybrid)', price: 320, rating: 4.6, seller: 'Maize Masters', category: 'seeds' },
    { id: 'seeds-8', name: 'Chili Seeds', price: 2200, rating: 4.3, seller: 'Spice Gardens', category: 'seeds' }
  ],
  crops: [
    { id: 'crops-1', name: 'Fresh Basmati Rice', price: 65, rating: 4.6, seller: 'Rice Valley', category: 'crops' },
    { id: 'crops-2', name: 'Organic Wheat', price: 28, rating: 4.4, seller: 'Organic Farm Co.', category: 'crops' },
    { id: 'crops-3', name: 'Red Onions', price: 22, rating: 4.1, seller: 'Onion Traders', category: 'crops' },
    { id: 'crops-4', name: 'Fresh Tomatoes', price: 35, rating: 4.3, seller: 'Veggie Fresh', category: 'crops' },
    // Additional products for "View All"
    { id: 'crops-5', name: 'Green Chili', price: 45, rating: 4.2, seller: 'Spicy Harvest', category: 'crops' },
    { id: 'crops-6', name: 'Fresh Cauliflower', price: 30, rating: 4.0, seller: 'Veggie Garden', category: 'crops' },
    { id: 'crops-7', name: 'Organic Carrots', price: 40, rating: 4.5, seller: 'Root Veggies', category: 'crops' },
    { id: 'crops-8', name: 'Fresh Spinach', price: 25, rating: 4.7, seller: 'Leafy Greens', category: 'crops' }
  ],
  fertilizers: [
    { id: 'fert-1', name: 'Cow Dung Manure', price: 8, rating: 4.8, seller: 'Organic Manure Co.', category: 'fertilizers' },
    { id: 'fert-2', name: 'NPK Fertilizer (20:20:20)', price: 1850, rating: 4.2, seller: 'FertiFarm', category: 'fertilizers' },
    { id: 'fert-3', name: 'Vermicompost', price: 12, rating: 4.7, seller: 'Worm Farms', category: 'fertilizers' },
    { id: 'fert-4', name: 'Urea Fertilizer', price: 1200, rating: 4.0, seller: 'Agri Inputs', category: 'fertilizers' },
    // Additional products for "View All"
    { id: 'fert-5', name: 'Bone Meal Fertilizer', price: 45, rating: 4.3, seller: 'Organic Plus', category: 'fertilizers' },
    { id: 'fert-6', name: 'Potash Fertilizer', price: 1680, rating: 4.1, seller: 'Potash Pro', category: 'fertilizers' },
    { id: 'fert-7', name: 'Neem Cake', price: 35, rating: 4.6, seller: 'Neem Naturals', category: 'fertilizers' },
    { id: 'fert-8', name: 'Bio Compost', price: 15, rating: 4.4, seller: 'Bio Farm', category: 'fertilizers' }
  ],
  dairy: [
    { id: 'dairy-1', name: 'Fresh Buffalo Milk', price: 55, rating: 4.9, seller: 'Dairy Fresh', category: 'dairy' },
    { id: 'dairy-2', name: 'Cow Milk (A2)', price: 65, rating: 4.8, seller: 'Pure Milk Co.', category: 'dairy' },
    { id: 'dairy-3', name: 'Fresh Paneer', price: 320, rating: 4.5, seller: 'Paneer Palace', category: 'dairy' },
    { id: 'dairy-4', name: 'Farm Butter', price: 450, rating: 4.6, seller: 'Creamy Delights', category: 'dairy' },
    // Additional products for "View All"
    { id: 'dairy-5', name: 'Greek Yogurt', price: 180, rating: 4.4, seller: 'Yogurt Craft', category: 'dairy' },
    { id: 'dairy-6', name: 'Fresh Cream', price: 290, rating: 4.2, seller: 'Cream Dreams', category: 'dairy' },
    { id: 'dairy-7', name: 'Cottage Cheese', price: 280, rating: 4.3, seller: 'Cheese Corner', category: 'dairy' },
    { id: 'dairy-8', name: 'Ghee (Pure)', price: 850, rating: 4.8, seller: 'Golden Ghee', category: 'dairy' }
  ]
};

const categories = [
  {
    id: 'seeds',
    name: 'Seeds',
    description: 'Crop seeds and planting materials',
    icon: Sprout,
    color: 'green'
  },
  {
    id: 'crops',
    name: 'Crops',
    description: 'Harvested crops and grains',
    icon: Wheat,
    color: 'yellow'
  },
  {
    id: 'fertilizers',
    name: 'Fertilizers/Manure',
    description: 'Organic and chemical fertilizers, manure',
    icon: Package,
    color: 'blue'
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    description: 'Milk, cheese, and dairy products',
    icon: Milk,
    color: 'purple'
  }
];

export default function BuyCategoryPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState<{ [key: string]: boolean }>({});

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/buy/browse?category=${categoryId}`);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      seller: product.seller,
      rating: product.rating
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const toggleShowAll = (categoryId: string) => {
    setShowAll(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
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
      <div className="flex-1 p-6 space-y-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const products = sampleProducts[category.id as keyof typeof sampleProducts];
          const isShowingAll = showAll[category.id];
          const displayProducts = isShowingAll ? products : products.slice(0, 4);
          
          return (
            <Card key={category.id} className="bg-white border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                {/* Category Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{t(category.id as keyof typeof t)}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleShowAll(category.id)}
                      variant="outline"
                      className="border-ag-green text-ag-green hover:bg-ag-green hover:text-white"
                    >
                      {isShowingAll ? 'Show Less' : t('view_all')}
                    </Button>
                  </div>
                </div>

                {/* Sample Products */}
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayProducts.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{product.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{t('by_seller')} {product.seller}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-ag-green">₹{product.price}</span>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToCart(product)}
                            className="h-7 px-2 text-xs bg-ag-green hover:bg-ag-green/90 text-white"
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {t('add_to_cart')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}