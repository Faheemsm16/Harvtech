import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Package, CheckCircle, Camera, Image as ImageIcon } from "lucide-react";
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
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'gm', label: 'Grams (gm)' },
  { value: 'ton', label: 'Tons (ton)' },
  { value: 'liter', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
];

// Remove hardcoded category names as we'll use translation

export default function ProductUploadPage() {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      productDescription: '', // Keep for schema compatibility but won't show in form
      quantity: 1,
      quantityUnit: 'kg',
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
        title: t('success'),
        description: t('product_added_successfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, imageUrl]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: InsertMarketplaceProduct) => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: "Please log in to upload products",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...data,
      sellerId: user.id,
      productDescription: "", // Default empty description since we removed the field
      imageUrls: JSON.stringify(uploadedImages),
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
              <h2 className="text-lg font-semibold">{t('product_uploaded')}</h2>
              <p className="text-sm opacity-90">Your product is now available</p>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('success')}</h3>
          <p className="text-gray-600 text-center mb-8">
            {t('product_added_successfully')}
          </p>
          <Button 
            onClick={handleBack}
            className="bg-ag-green hover:bg-ag-green/90 text-white px-8 py-3"
          >
            {t('back_to_marketplace')}
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
            <h2 className="text-lg font-semibold">{t('upload_product')}</h2>
            <p className="text-sm opacity-90">{t('category')}: {t(category as keyof typeof t)}</p>
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

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label>Product Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-sm">Gallery</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-sm">Camera</span>
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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