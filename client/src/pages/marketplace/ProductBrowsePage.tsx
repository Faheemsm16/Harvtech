import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, Minus, ShoppingCart, Package, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type MarketplaceProduct, type InsertCartItem } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryNames: Record<string, string> = {
  seeds: 'Seeds',
  fertilizers: 'Fertilizers',
  pesticides: 'Pesticides',
  equipments: 'Equipments',
  others: 'Others'
};

export default function ProductBrowsePage() {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Get category from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const category = urlParams.get('category') || 'all';

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/marketplace/products', category],
    queryFn: async () => {
      const url = category === 'all' 
        ? '/api/marketplace/products' 
        : `/api/marketplace/products?category=${category}`;
      return await apiRequest(url);
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: InsertCartItem) => {
      return await apiRequest('/api/marketplace/cart', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Product added to cart successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: async (data: { buyerId: string; productId: string; quantity: number; paymentMethod: string; shippingAddress: string }) => {
      return await apiRequest('/api/marketplace/buy-now', 'POST', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${data.orderId.slice(-8)} has been created`,
      });
      setShowBuyModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation('/marketplace/buy');
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const handleAddToCart = (product: MarketplaceProduct) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    const quantity = quantities[product.id] || 1;
    addToCartMutation.mutate({
      buyerId: user.id,
      productId: product.id,
      quantity,
    });
  };

  const handleBuyNow = (product: MarketplaceProduct) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to buy products",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProduct(product);
    setShowBuyModal(true);
  };

  const handleConfirmBuy = () => {
    if (!selectedProduct || !user?.id || !paymentMethod || !shippingAddress) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = quantities[selectedProduct.id] || 1;
    buyNowMutation.mutate({
      buyerId: user.id,
      productId: selectedProduct.id,
      quantity,
      paymentMethod,
      shippingAddress,
    });
  };

  const filteredProducts = products?.filter((product: MarketplaceProduct) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.productDescription && product.productDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

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
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Browse Products</h2>
            <p className="text-sm opacity-90">Category: {categoryNames[category] || 'All Categories'}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setLocation('/marketplace/cart')}
            className="text-white hover:bg-white/10 p-2"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchQuery ? "Try adjusting your search terms" : "No products available in this category"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product: MarketplaceProduct) => (
              <Card key={product.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {/* Product Image Placeholder */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {categoryNames[product.category]}
                        </Badge>
                      </div>
                      
                      {product.productDescription && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.productDescription}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-bold text-ag-green">
                            ₹{product.pricePerUnit}
                          </div>
                          <div className="text-sm text-gray-500">
                            per {product.quantityUnit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity Selector and Add to Cart */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={(quantities[product.id] || 1) <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">
                        {quantities[product.id] || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleBuyNow(product)}
                        disabled={buyNowMutation.isPending || !product.isAvailable}
                        variant="outline"
                        className="border-ag-green text-ag-green hover:bg-ag-green/10"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Buy Now
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={addToCartMutation.isPending || !product.isAvailable}
                        className="bg-ag-green hover:bg-ag-green/90 text-white"
                      >
                        {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Buy Now Modal */}
      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Now</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{selectedProduct.productName}</h3>
                <p className="text-sm text-gray-600">₹{selectedProduct.pricePerUnit} per {selectedProduct.quantityUnit}</p>
                <p className="text-sm text-gray-600">Quantity: {quantities[selectedProduct.id] || 1}</p>
                <p className="text-lg font-bold text-ag-green mt-2">
                  Total: ₹{selectedProduct.pricePerUnit * (quantities[selectedProduct.id] || 1)}
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Wallet">Wallet</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Shipping Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete shipping address..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBuy}
              disabled={buyNowMutation.isPending || !paymentMethod || !shippingAddress}
              className="bg-ag-green hover:bg-ag-green/90"
            >
              {buyNowMutation.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}