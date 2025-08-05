import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// TODO: Add language context back when available
// import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMarketplaceProductSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Search, Plus, ShoppingCart, Package, Star } from "lucide-react";
import { z } from "zod";
import type { MarketplaceProduct } from "@shared/schema";

const productFormSchema = insertMarketplaceProductSchema.extend({
  category: z.string().min(1, "Category is required"),
  pricePerUnit: z.number().min(0.01, "Price must be greater than 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const categories = ["Seeds", "Fertilizers", "Pesticides", "Equipment", "Others"];

export default function MarketplaceHome() {
  // const { t } = useLanguage(); // TODO: Add language context back
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      category: "",
      pricePerUnit: 0,
      quantity: 1,
      quantityUnit: "piece",
      imageUrls: "",
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/products', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/marketplace/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return await apiRequest('/api/marketplace/cart', 'POST', { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      return await apiRequest('/api/marketplace/products', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products'] });
      setShowAddProduct(false);
      form.reset();
    },
  });

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const handleCreateProduct = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-2">
              Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Buy and sell agricultural products
            </p>
          </div>
          
          {user && (
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus size={16} className="mr-2" />
                  Sell Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Add New Product
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateProduct)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter product name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pricePerUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="0" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="1" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="quantityUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Piece">Piece</SelectItem>
                              <SelectItem value="KG">Kilogram</SelectItem>
                              <SelectItem value="Quintal">Quintal</SelectItem>
                              <SelectItem value="Packet">Packet</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="productDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Product description" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imageUrls"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/image.jpg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={createProductMutation.isPending}
                      >
                        {createProductMutation.isPending ? "Adding..." : "Add Product"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddProduct(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: MarketplaceProduct) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={(product.imageUrls && JSON.parse(product.imageUrls || '[]')[0]) || `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center`}
                    alt={product.productName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-600">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.productName}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {product.productDescription}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{product.pricePerUnit}
                      <span className="text-sm font-normal text-gray-500">
                        /{product.quantityUnit}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.quantity} available
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">4.5</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addToCartMutation.isPending || product.quantity === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart size={16} className="mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}