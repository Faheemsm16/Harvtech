import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk, ShoppingCart, Star, Plus, Minus, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useCart } from '@/context/CartContext';
import { CartIcon } from '@/components/CartIcon';
import { useToast } from '@/hooks/use-toast';
import { useCustomAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

// Sample products for each category with extended data for "View All" and measurement units
const sampleProducts = {
  seeds: [
    { id: 'seeds-1', name: 'Basmati Rice Seeds', price: 2500, rating: 4.5, seller: 'Green Valley Seeds', category: 'seeds', unit: 'kg', unitStep: 0.5, minOrder: 1 },
    { id: 'seeds-2', name: 'Hybrid Tomato Seeds', price: 1200, rating: 4.3, seller: 'Agri Solutions', category: 'seeds', unit: 'gm', unitStep: 100, minOrder: 250 },
    { id: 'seeds-3', name: 'Wheat Seeds (HD-2967)', price: 35, rating: 4.7, seller: 'Farm Direct', category: 'seeds', unit: 'kg', unitStep: 1, minOrder: 5 },
    { id: 'seeds-4', name: 'Sunflower Seeds', price: 180, rating: 4.2, seller: 'Sunny Farms', category: 'seeds', unit: 'kg', unitStep: 0.5, minOrder: 2 },
    // Additional products for "View All"
    { id: 'seeds-5', name: 'Cotton Seeds (Bt)', price: 890, rating: 4.4, seller: 'Cotton Kings', category: 'seeds', unit: 'gm', unitStep: 500, minOrder: 1000 },
    { id: 'seeds-6', name: 'Mustard Seeds', price: 85, rating: 4.1, seller: 'Oil Seeds Co.', category: 'seeds', unit: 'kg', unitStep: 1, minOrder: 2 },
    { id: 'seeds-7', name: 'Corn Seeds (Hybrid)', price: 320, rating: 4.6, seller: 'Maize Masters', category: 'seeds', unit: 'kg', unitStep: 0.5, minOrder: 1 },
    { id: 'seeds-8', name: 'Chili Seeds', price: 2200, rating: 4.3, seller: 'Spice Gardens', category: 'seeds', unit: 'gm', unitStep: 50, minOrder: 100 }
  ],
  crops: [
    { id: 'crops-1', name: 'Fresh Basmati Rice', price: 65, rating: 4.6, seller: 'Rice Valley', category: 'crops', unit: 'kg', unitStep: 1, minOrder: 5 },
    { id: 'crops-2', name: 'Organic Wheat', price: 28, rating: 4.4, seller: 'Organic Farm Co.', category: 'crops', unit: 'kg', unitStep: 5, minOrder: 25 },
    { id: 'crops-3', name: 'Red Onions', price: 22, rating: 4.1, seller: 'Onion Traders', category: 'crops', unit: 'kg', unitStep: 1, minOrder: 10 },
    { id: 'crops-4', name: 'Fresh Tomatoes', price: 35, rating: 4.3, seller: 'Veggie Fresh', category: 'crops', unit: 'kg', unitStep: 1, minOrder: 5 },
    // Additional products for "View All"
    { id: 'crops-5', name: 'Green Chili', price: 45, rating: 4.2, seller: 'Spicy Harvest', category: 'crops', unit: 'kg', unitStep: 0.5, minOrder: 2 },
    { id: 'crops-6', name: 'Fresh Cauliflower', price: 30, rating: 4.0, seller: 'Veggie Garden', category: 'crops', unit: 'kg', unitStep: 1, minOrder: 3 },
    { id: 'crops-7', name: 'Organic Carrots', price: 40, rating: 4.5, seller: 'Root Veggies', category: 'crops', unit: 'kg', unitStep: 1, minOrder: 2 },
    { id: 'crops-8', name: 'Fresh Spinach', price: 25, rating: 4.7, seller: 'Leafy Greens', category: 'crops', unit: 'gm', unitStep: 250, minOrder: 500 }
  ],
  fertilizers: [
    { id: 'fert-1', name: 'Cow Dung Manure', price: 8, rating: 4.8, seller: 'Organic Manure Co.', category: 'fertilizers', unit: 'kg', unitStep: 5, minOrder: 25 },
    { id: 'fert-2', name: 'NPK Fertilizer (20:20:20)', price: 1850, rating: 4.2, seller: 'FertiFarm', category: 'fertilizers', unit: 'kg', unitStep: 1, minOrder: 5 },
    { id: 'fert-3', name: 'Vermicompost', price: 12, rating: 4.7, seller: 'Worm Farms', category: 'fertilizers', unit: 'kg', unitStep: 5, minOrder: 10 },
    { id: 'fert-4', name: 'Urea Fertilizer', price: 1200, rating: 4.0, seller: 'Agri Inputs', category: 'fertilizers', unit: 'kg', unitStep: 10, minOrder: 50 },
    // Additional products for "View All"
    { id: 'fert-5', name: 'Bone Meal Fertilizer', price: 45, rating: 4.3, seller: 'Organic Plus', category: 'fertilizers', unit: 'kg', unitStep: 1, minOrder: 5 },
    { id: 'fert-6', name: 'Potash Fertilizer', price: 1680, rating: 4.1, seller: 'Potash Pro', category: 'fertilizers', unit: 'kg', unitStep: 1, minOrder: 10 },
    { id: 'fert-7', name: 'Neem Cake', price: 35, rating: 4.6, seller: 'Neem Naturals', category: 'fertilizers', unit: 'kg', unitStep: 1, minOrder: 5 },
    { id: 'fert-8', name: 'Bio Compost', price: 15, rating: 4.4, seller: 'Bio Farm', category: 'fertilizers', unit: 'kg', unitStep: 5, minOrder: 20 }
  ],
  dairy: [
    { id: 'dairy-1', name: 'Fresh Buffalo Milk', price: 55, rating: 4.9, seller: 'Dairy Fresh', category: 'dairy', unit: 'liter', unitStep: 0.5, minOrder: 1 },
    { id: 'dairy-2', name: 'Cow Milk (A2)', price: 65, rating: 4.8, seller: 'Pure Milk Co.', category: 'dairy', unit: 'liter', unitStep: 0.5, minOrder: 1 },
    { id: 'dairy-3', name: 'Fresh Paneer', price: 320, rating: 4.5, seller: 'Paneer Palace', category: 'dairy', unit: 'kg', unitStep: 0.25, minOrder: 0.5 },
    { id: 'dairy-4', name: 'Farm Butter', price: 450, rating: 4.6, seller: 'Creamy Delights', category: 'dairy', unit: 'gm', unitStep: 250, minOrder: 500 },
    // Additional products for "View All"
    { id: 'dairy-5', name: 'Greek Yogurt', price: 180, rating: 4.4, seller: 'Yogurt Craft', category: 'dairy', unit: 'gm', unitStep: 250, minOrder: 500 },
    { id: 'dairy-6', name: 'Fresh Cream', price: 290, rating: 4.2, seller: 'Cream Dreams', category: 'dairy', unit: 'ml', unitStep: 200, minOrder: 500 },
    { id: 'dairy-7', name: 'Cottage Cheese', price: 280, rating: 4.3, seller: 'Cheese Corner', category: 'dairy', unit: 'gm', unitStep: 250, minOrder: 500 },
    { id: 'dairy-8', name: 'Ghee (Pure)', price: 850, rating: 4.8, seller: 'Golden Ghee', category: 'dairy', unit: 'gm', unitStep: 250, minOrder: 500 }
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
  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const { user } = useCustomAuth();
  const [showAll, setShowAll] = useState<{ [key: string]: boolean }>({});
  const [cartAnimations, setCartAnimations] = useState<{ [key: string]: number }>({});
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});

  // Fetch user's own products
  const { data: userProducts = [] } = useQuery<any[]>({
    queryKey: ['/api/marketplace/products', 'user', user?.id],
    enabled: !!user?.id,
  });

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/buy/browse?category=${categoryId}`);
  };

  const handleAddToCart = (product: any, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        seller: product.seller,
        rating: product.rating,
        unit: product.unit
      });
    }

    // Show animated feedback
    setCartAnimations(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + quantity
    }));

    // Clear animation after 2 seconds
    setTimeout(() => {
      setCartAnimations(prev => ({
        ...prev,
        [product.id]: 0
      }));
    }, 2000);

    toast({
      title: "Added to cart",
      description: `${formatUnit(quantity, product.unit)} of ${product.name} added to your cart`,
    });
  };

  const updateProductQuantity = (productId: string, change: number, product: any) => {
    setProductQuantities(prev => {
      const currentQty = prev[productId] || product.minOrder;
      const newQty = Math.max(product.minOrder, currentQty + (change * product.unitStep));
      return {
        ...prev,
        [productId]: newQty
      };
    });
  };

  const formatUnit = (quantity: number, unit: string) => {
    if (unit === 'gm' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)} kg`;
    }
    if (unit === 'ml' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)} liter`;
    }
    return `${quantity} ${unit}`;
  };

  const getCartItemQuantity = (productId: string) => {
    const cartItem = items.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
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
        {/* My Products Section */}
        {user && (
          <Card className="bg-white border-2 border-ag-green/20">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-r from-ag-green/5 to-ag-green/10 border-b border-ag-green/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-ag-green/20 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-ag-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">My Products</h3>
                      <p className="text-sm text-gray-600">Products you're currently selling</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLocation('/marketplace/sell')}
                    className="bg-ag-green hover:bg-ag-green/90 text-white"
                  >
                    + Add Product
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                {userProducts && userProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userProducts.map((product: any) => (
                      <Card key={product.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{product.productName}</h4>
                              <p className="text-sm text-gray-500">
                                {product.quantity} {product.quantityUnit} available
                              </p>
                              <p className="text-lg font-semibold text-ag-green mt-1">
                                ₹{product.pricePerUnit} per {product.quantityUnit}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/marketplace/sell/upload?edit=${product.id}&category=${product.category}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              product.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.isAvailable ? 'Available' : 'Unavailable'}
                            </div>
                            <p className="text-xs text-gray-500">
                              Category: {product.category}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                    <p className="text-gray-500 mb-4">Start selling by adding your first product</p>
                    <Button
                      onClick={() => setLocation('/marketplace/sell')}
                      className="bg-ag-green hover:bg-ag-green/90 text-white"
                    >
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories with Products */}
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
                    {displayProducts.map((product) => {
                      const currentQuantity = productQuantities[product.id] || product.minOrder;
                      const cartQuantity = getCartItemQuantity(product.id);
                      const animationCount = cartAnimations[product.id] || 0;
                      
                      return (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                          {/* Cart Animation Feedback */}
                          {animationCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-ag-green text-white rounded-full w-10 h-8 flex items-center justify-center text-xs font-bold animate-bounce z-10">
                              +{formatUnit(animationCount, product.unit)}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{t('by_seller')} {product.seller}</p>
                          
                          {/* Cart quantity indicator if item is in cart */}
                          {cartQuantity > 0 && (
                            <div className="mb-2">
                              <span className="text-xs bg-ag-green/10 text-ag-green px-2 py-1 rounded-full">
                                {formatUnit(cartQuantity, product.unit)} in cart
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-ag-green">₹{product.price}</span>
                            <div className="text-xs text-gray-500">per {product.unit}</div>
                          </div>
                          
                          {/* Unit-based Quantity Controls */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600">Quantity:</span>
                              <span className="text-xs text-gray-500">Min: {formatUnit(product.minOrder, product.unit)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProductQuantity(product.id, -1, product)}
                                className="h-7 w-7 p-0 border-gray-300"
                                disabled={currentQuantity <= product.minOrder}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="flex-1 text-center">
                                <span className="text-sm font-medium bg-gray-50 px-2 py-1 rounded border">
                                  {formatUnit(currentQuantity, product.unit)}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateProductQuantity(product.id, 1, product)}
                                className="h-7 w-7 p-0 border-gray-300"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-gray-600">Total: </span>
                              <span className="font-semibold text-ag-green">
                                ₹{(product.price * currentQuantity).toLocaleString()}
                              </span>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => handleAddToCart(product, currentQuantity)}
                              className="h-8 px-3 text-xs bg-ag-green hover:bg-ag-green/90 text-white flex items-center space-x-1"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              <span>Add to Cart</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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