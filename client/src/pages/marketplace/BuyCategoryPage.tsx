import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk, ShoppingCart, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

// Sample products for each category
const sampleProducts = {
  seeds: [
    { name: 'Basmati Rice Seeds', price: '₹2,500/kg', rating: 4.5, seller: 'Green Valley Seeds' },
    { name: 'Hybrid Tomato Seeds', price: '₹1,200/packet', rating: 4.3, seller: 'Agri Solutions' },
    { name: 'Wheat Seeds (HD-2967)', price: '₹35/kg', rating: 4.7, seller: 'Farm Direct' },
    { name: 'Sunflower Seeds', price: '₹180/kg', rating: 4.2, seller: 'Sunny Farms' }
  ],
  crops: [
    { name: 'Fresh Basmati Rice', price: '₹65/kg', rating: 4.6, seller: 'Rice Valley' },
    { name: 'Organic Wheat', price: '₹28/kg', rating: 4.4, seller: 'Organic Farm Co.' },
    { name: 'Red Onions', price: '₹22/kg', rating: 4.1, seller: 'Onion Traders' },
    { name: 'Fresh Tomatoes', price: '₹35/kg', rating: 4.3, seller: 'Veggie Fresh' }
  ],
  fertilizers: [
    { name: 'Cow Dung Manure', price: '₹8/kg', rating: 4.8, seller: 'Organic Manure Co.' },
    { name: 'NPK Fertilizer (20:20:20)', price: '₹1,850/50kg', rating: 4.2, seller: 'FertiFarm' },
    { name: 'Vermicompost', price: '₹12/kg', rating: 4.7, seller: 'Worm Farms' },
    { name: 'Urea Fertilizer', price: '₹1,200/50kg', rating: 4.0, seller: 'Agri Inputs' }
  ],
  dairy: [
    { name: 'Fresh Buffalo Milk', price: '₹55/liter', rating: 4.9, seller: 'Dairy Fresh' },
    { name: 'Cow Milk (A2)', price: '₹65/liter', rating: 4.8, seller: 'Pure Milk Co.' },
    { name: 'Fresh Paneer', price: '₹320/kg', rating: 4.5, seller: 'Paneer Palace' },
    { name: 'Farm Butter', price: '₹450/kg', rating: 4.6, seller: 'Creamy Delights' }
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

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/buy/browse?category=${categoryId}`);
  };

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
            <h2 className="text-lg font-semibold">{t('buy')} {t('marketplace')}</h2>
            <p className="text-sm opacity-90">Select a category to browse products</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const products = sampleProducts[category.id as keyof typeof sampleProducts];
          
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
                      onClick={() => handleCategorySelect(category.id)}
                      className="bg-ag-green hover:bg-ag-green/90 text-white"
                    >
                      {t('view_all')}
                    </Button>
                  </div>
                </div>

                {/* Sample Products */}
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((product, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{product.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{t('by_seller')} {product.seller}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-ag-green">{product.price}</span>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
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