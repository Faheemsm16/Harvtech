import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useCustomAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

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

export default function SellCategoryPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();

  // Fetch user's own products
  const { data: userProducts = [] } = useQuery<any[]>({
    queryKey: ['/api/marketplace/products', 'user', user?.id],
    enabled: !!user?.id,
  });

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/sell/upload?category=${categoryId}`);
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
            <h2 className="text-lg font-semibold">{t('sell')} {t('marketplace')}</h2>
            <p className="text-sm opacity-90">Select a category for your product</p>
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
                    onClick={() => handleCategorySelect('seeds')}
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
                      onClick={() => handleCategorySelect('seeds')}
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

        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id} className="bg-white border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{t(category.id as keyof typeof t)}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-gray-400 self-center">→</div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}