import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Package, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertMarketplaceProductSchema, type InsertMarketplaceProduct } from "@shared/schema";
import { useCustomAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const quantityUnits = [
  { value: 'KG', label: 'KG' },
  { value: 'Quintal', label: 'Quintal' },
  { value: 'Packet', label: 'Packet' },
  { value: 'Piece', label: 'Piece' },
  { value: 'Ton', label: 'Ton' },
];

const categoryNames: Record<string, string> = {
  seeds: 'Seeds',
  fertilizers: 'Fertilizers',
  pesticides: 'Pesticides',
  equipments: 'Equipments',
  others: 'Others'
};

export default function ProductUploadPage() {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Get category from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const category = urlParams.get('category') || 'others';

  const form = useForm<InsertMarketplaceProduct>({
    resolver: zodResolver(insertMarketplaceProductSchema.extend({
      productName: insertMarketplaceProductSchema.shape.productName.min(1, "Product name is required"),
      quantity: insertMarketplaceProductSchema.shape.quantity.min(1, "Quantity must be at least 1"),
      pricePerUnit: insertMarketplaceProductSchema.shape.pricePerUnit.min(1, "Price must be at least ₹1"),
    })),
    defaultValues: {
      sellerId: user?.id || '',
      category: category as any,
      productName: '',
      productDescription: '',
      quantity: 1,
      quantityUnit: 'KG',
      pricePerUnit: 1,
      imageUrls: '[]',
      isAvailable: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertMarketplaceProduct) => {
      return await apiRequest('/api/marketplace/products', 'POST', data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products'] });
      toast({
        title: "Success!",
        description: "Product added successfully to Marketplace!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload product",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    if (isSuccess) {
      setLocation('/marketplace');
    } else {
      setLocation('/marketplace/sell');
    }
  };

  const onSubmit = (data: InsertMarketplaceProduct) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to upload products",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...data,
      sellerId: user.id,
    });
  };

  if (isSuccess) {
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
              <h2 className="text-lg font-semibold">Product Uploaded</h2>
              <p className="text-sm opacity-90">Your product is now available</p>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 text-center mb-8">
            Product added successfully to Marketplace!
          </p>
          <Button 
            onClick={handleBack}
            className="bg-ag-green hover:bg-ag-green/90 text-white px-8 py-3"
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

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
            <h2 className="text-lg font-semibold">Upload Product</h2>
            <p className="text-sm opacity-90">Category: {categoryNames[category]}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Product Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your product..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {quantityUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per unit (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="Enter price"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload Placeholder */}
                <div className="space-y-2">
                  <Label>Upload Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Tap to upload images from phone gallery or camera
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Image upload will be implemented with object storage)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 text-lg font-semibold"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Uploading..." : "Upload Product"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}