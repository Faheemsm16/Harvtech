import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Sprout, Wheat, Milk, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useCustomAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's own products with real-time updates
  const { data: userProducts = [], refetch: refetchProducts } = useQuery<any[]>({
    queryKey: ['/api/marketplace/products', 'user', user?.id],
    enabled: !!user?.id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('DELETE', `/api/marketplace/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products'] });
      toast({
        title: "Product deleted",
        description: "Your product has been successfully removed from the marketplace",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleCategorySelect = (categoryId: string) => {
    setLocation(`/marketplace/sell/upload?category=${categoryId}`);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(productId);
    }
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
                    onClick={() => setLocation('/marketplace/sell/upload?category=seeds')}
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
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteProduct(product.id, product.productName)}
                                disabled={deleteProductMutation.isPending}
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
                      onClick={() => setLocation('/marketplace/sell/upload?category=seeds')}
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
      </div>
    </div>
  );
}