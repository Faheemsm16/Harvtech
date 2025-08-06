import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type MarketplaceProduct } from "@shared/schema";

export default function MyProductsPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<MarketplaceProduct[]>({
    queryKey: ['/api/marketplace/products/user', user?.id],
    enabled: !!user?.id,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ productId, isAvailable }: { productId: string; isAvailable: boolean }) => {
      return await apiRequest('PATCH', `/api/marketplace/products/${productId}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products/user', user?.id] });
      toast({
        title: t('success'),
        description: "Product availability updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('DELETE', `/api/marketplace/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products/user', user?.id] });
      toast({
        title: t('success'),
        description: "Product deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleAddProduct = () => {
    setLocation('/marketplace/sell');
  };

  const handleToggleAvailability = (productId: string, currentStatus: boolean) => {
    toggleAvailabilityMutation.mutate({
      productId,
      isAvailable: !currentStatus
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seeds': return 'bg-green-100 text-green-800';
      case 'fertilizers': return 'bg-blue-100 text-blue-800';
      case 'pesticides': return 'bg-orange-100 text-orange-800';
      case 'equipments': return 'bg-purple-100 text-purple-800';
      case 'crops': return 'bg-yellow-100 text-yellow-800';
      case 'dairy': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCategory = (category: string) => {
    const categories: Record<string, string> = {
      seeds: 'Seeds',
      fertilizers: 'Fertilizers',
      pesticides: 'Pesticides',
      equipments: 'Equipment',
      crops: 'Crops',
      dairy: 'Dairy',
      others: 'Others'
    };
    return categories[category] || category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto text-ag-green mb-4" />
          <p className="text-gray-600">Loading your products...</p>
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
              <h2 className="text-lg font-semibold">My Products</h2>
              <p className="text-sm opacity-90">{products.length} products listed</p>
            </div>
          </div>
          <Button
            onClick={handleAddProduct}
            className="bg-white text-ag-green hover:bg-gray-100 text-sm px-3 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first product to the marketplace</p>
            <Button onClick={handleAddProduct} className="bg-ag-green hover:bg-ag-green/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const images = product.imageUrls ? JSON.parse(product.imageUrls) : [];
              return (
                <Card key={product.id} className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {images.length > 0 ? (
                          <img
                            src={images[0]}
                            alt={product.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                            <Badge className={`text-xs mt-1 ${getCategoryColor(product.category)}`}>
                              {formatCategory(product.category)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAvailability(product.id, Boolean(product.isAvailable))}
                              className={`p-2 ${product.isAvailable ? 'text-green-600' : 'text-gray-400'}`}
                            >
                              {product.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {product.quantity} {product.quantityUnit}
                          </div>
                          <div className="text-lg font-bold text-ag-green">
                            ₹{product.pricePerUnit}/{product.quantityUnit}
                          </div>
                        </div>

                        <div className="mt-2">
                          <Badge 
                            className={product.isAvailable ? 
                              'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {product.isAvailable ? 'Available' : 'Hidden'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}