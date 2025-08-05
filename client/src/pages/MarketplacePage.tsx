import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Search, Plus, Package, Store, Truck, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { insertMarketplaceProductSchema, insertCartItemSchema } from "@shared/schema";
import type { MarketplaceProduct, MarketplaceCategory, CartItem } from "@shared/schema";
import { z } from "zod";

const productFormSchema = insertMarketplaceProductSchema.omit({ 
  id: true,
  sellerId: true, 
  createdAt: true, 
  updatedAt: true, 
  isActive: true 
}).extend({
  imageUrls: z.array(z.string()).optional()
});
type ProductFormData = z.infer<typeof productFormSchema>;

const translations = {
  english: {
    title: "Marketplace",
    searchPlaceholder: "Search products...",
    allCategories: "All Categories",
    buy: "Buy",
    sell: "Sell",
    cart: "Cart",
    orders: "Orders",
    addProduct: "Add Product",
    productName: "Product Name",
    description: "Description",
    price: "Price (₹)",
    category: "Category",
    quantity: "Quantity",
    unit: "Unit",
    uploadImage: "Upload Image",
    createProduct: "Create Product",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    outOfStock: "Out of Stock",
    cartEmpty: "Your cart is empty",
    totalAmount: "Total Amount",
    checkout: "Checkout",
    removeFromCart: "Remove",
    updateQuantity: "Update Quantity",
    myProducts: "My Products",
    noProducts: "No products available",
    loading: "Loading...",
    productCreated: "Product created successfully",
    addedToCart: "Added to cart successfully",
    error: "An error occurred"
  },
  tamil: {
    title: "மார்க்கெட்பிளேஸ்",
    searchPlaceholder: "தயாரிப்புகளைத் தேடுங்கள்...",
    allCategories: "அனைத்து வகைகள்",
    buy: "வாங்க",
    sell: "விற்க",
    cart: "கார்ட்",
    orders: "ஆர்டர்கள்",
    addProduct: "தயாரிப்பு சேர்க்க",
    productName: "தயாரிப்பு பெயர்",
    description: "விளக்கம்",
    price: "விலை (₹)",
    category: "வகை",
    quantity: "அளவு",
    unit: "யூனிட்",
    uploadImage: "படம் பதிவேற்ற",
    createProduct: "தயாரிப்பு உருவாக்க",
    addToCart: "கார்ட்டில் சேர்க்க",
    buyNow: "இப்போது வாங்க",
    outOfStock: "இல்லை",
    cartEmpty: "உங்கள் கார்ட் காலியாக உள்ளது",
    totalAmount: "மொத்த தொகை",
    checkout: "செக் அவுட்",
    removeFromCart: "அகற்று",
    updateQuantity: "அளவு புதுப்பிக்க",
    myProducts: "என் தயாரிப்புகள்",
    noProducts: "தயாரிப்புகள் இல்லை",
    loading: "ஏற்றுகிறது...",
    productCreated: "தயாரிப்பு வெற்றிகரமாக உருவாக்கப்பட்டது",
    addedToCart: "கார்ட்டில் வெற்றிகரமாக சேர்க்கப்பட்டது",
    error: "பிழை ஏற்பட்டது"
  },
  hindi: {
    title: "मार्केटप्लेस",
    searchPlaceholder: "उत्पाद खोजें...",
    allCategories: "सभी श्रेणियां",
    buy: "खरीदें",
    sell: "बेचें",
    cart: "कार्ट",
    orders: "ऑर्डर",
    addProduct: "उत्पाद जोड़ें",
    productName: "उत्पाद का नाम",
    description: "विवरण",
    price: "कीमत (₹)",
    category: "श्रेणी",
    quantity: "मात्रा",
    unit: "यूनिट",
    uploadImage: "फोटो अपलोड करें",
    createProduct: "उत्पाद बनाएं",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    outOfStock: "स्टॉक नहीं",
    cartEmpty: "आपका कार्ट खाली है",
    totalAmount: "कुल राशि",
    checkout: "चेकआउट",
    removeFromCart: "हटाएं",
    updateQuantity: "मात्रा बदलें",
    myProducts: "मेरे उत्पाद",
    noProducts: "कोई उत्पाद उपलब्ध नहीं",
    loading: "लोड हो रहा है...",
    productCreated: "उत्पाद सफलतापूर्वक बनाया गया",
    addedToCart: "कार्ट में सफलतापूर्वक जोड़ा गया",
    error: "एक त्रुटि हुई"
  },
  telugu: {
    title: "మార్కెట్‌ప్లేస్",
    searchPlaceholder: "ఉత్పత్తులను వెతకండి...",
    allCategories: "అన్ని వర్గాలు",
    buy: "కొనండి",
    sell: "అమ్మండి",
    cart: "కార్ట్",
    orders: "ఆర్డర్లు",
    addProduct: "ఉత్పత్తి జోడించండి",
    productName: "ఉత్పత్తి పేరు",
    description: "వివరణ",
    price: "ధర (₹)",
    category: "వర్గం",
    quantity: "పరిమాణం",
    unit: "యూనిట్",
    uploadImage: "చిత్రం అప్‌లోడ్ చేయండి",
    createProduct: "ఉత్పత్తి సృష్టించండి",
    addToCart: "కార్ట్‌కు జోడించండి",
    buyNow: "ఇప్పుడు కొనండి",
    outOfStock: "స్టాక్ లేదు",
    cartEmpty: "మీ కార్ట్ ఖాళీగా ఉంది",
    totalAmount: "మొత్తం మొత్తం",
    checkout: "చెక్‌అవుట్",
    removeFromCart: "తీసివేయండి",
    updateQuantity: "పరిమాణం నవీకరించండి",
    myProducts: "నా ఉత్పత్తులు",
    noProducts: "ఉత్పత్తులు అందుబాటులో లేవు",
    loading: "లోడ్ అవుతోంది...",
    productCreated: "ఉత్పత్తి విజయవంతంగా సృష్టించబడింది",
    addedToCart: "కార్ట్‌కు విజయవంతంగా జోడించబడింది",
    error: "లోపం సంభవించింది"
  },
  kannada: {
    title: "ಮಾರುಕಟ್ಟೆ",
    searchPlaceholder: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...",
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    buy: "ಖರೀದಿಸಿ",
    sell: "ಮಾರಿ",
    cart: "ಕಾರ್ಟ್",
    orders: "ಆದೇಶಗಳು",
    addProduct: "ಉತ್ಪನ್ನ ಸೇರಿಸಿ",
    productName: "ಉತ್ಪನ್ನದ ಹೆಸರು",
    description: "ವಿವರಣೆ",
    price: "ಬೆಲೆ (₹)",
    category: "ವರ್ಗ",
    quantity: "ಪ್ರಮಾಣ",
    unit: "ಯೂನಿಟ್",
    uploadImage: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    createProduct: "ಉತ್ಪನ್ನ ರಚಿಸಿ",
    addToCart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    buyNow: "ಈಗ ಖರೀದಿಸಿ",
    outOfStock: "ಸ್ಟಾಕ್ ಇಲ್ಲ",
    cartEmpty: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
    totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
    checkout: "ಚೆಕ್‌ಔಟ್",
    removeFromCart: "ತೆಗೆದುಹಾಕಿ",
    updateQuantity: "ಪ್ರಮಾಣ ನವೀಕರಿಸಿ",
    myProducts: "ನನ್ನ ಉತ್ಪನ್ನಗಳು",
    noProducts: "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಲಭ್ಯವಿಲ್ಲ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    productCreated: "ಉತ್ಪನ್ನ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ",
    addedToCart: "ಕಾರ್ಟ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ",
    error: "ದೋಷ ಸಂಭವಿಸಿದೆ"
  }
};

export default function MarketplacePage() {
  const { currentLanguage } = useLanguage();
  const { isAuthenticated, user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = translations[currentLanguage];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      quantity: 1,
      unit: "kg",
      imageUrls: [],
      status: "active"
    }
  });

  // Fetch categories
  const { data: categories = [], error: categoriesError } = useQuery<MarketplaceCategory[]>({
    queryKey: ['/api/marketplace/categories'],
    retry: 2
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<MarketplaceProduct[]>({
    queryKey: ['/api/marketplace/products', selectedCategory, searchTerm],
    queryFn: () => apiRequest('GET', '/api/marketplace/products', {
      params: {
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      }
    }).then(res => res.json()),
    retry: 2
  });

  // Fetch cart items
  const { data: cartItems = [] } = useQuery<(CartItem & { product: MarketplaceProduct })[]>({
    queryKey: ['/api/marketplace/cart'],
    enabled: isAuthenticated
  });

  // Fetch user's products (for sell tab)
  const { data: userProducts = [] } = useQuery<MarketplaceProduct[]>({
    queryKey: ['/api/marketplace/products/seller', user?.id],
    enabled: isAuthenticated && activeTab === "sell"
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => 
      apiRequest('POST', '/api/marketplace/products', { json: data }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: t.productCreated,
        description: t.productCreated
      });
      setShowAddProductDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/products'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.error,
        variant: "destructive"
      });
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      apiRequest('POST', '/api/marketplace/cart', { json: data }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: t.addedToCart,
        description: t.addedToCart
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.error,
        variant: "destructive"
      });
    }
  });

  const handleCreateProduct = (rawData: ProductFormData) => {
    // Transform single imageUrl to imageUrls array for database schema
    const data = {
      ...rawData,
      imageUrls: rawData.imageUrl ? [rawData.imageUrl] : [],
      // Remove the temporary imageUrl field
      imageUrl: undefined
    };
    createProductMutation.mutate(data);
  };

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('GET', '/api/objects/upload');
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      form.setValue('imageUrl', uploadedFile.uploadURL);
    }
  };

  const totalCartAmount = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );

  // Show errors if any
  if (categoriesError || productsError) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Marketplace</h2>
          <p className="text-gray-600 mb-4">
            {categoriesError?.message || productsError?.message || "Something went wrong"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
            {t.title}
          </h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Badge variant="secondary" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>{cartItems.length}</span>
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buy" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>{t.buy}</span>
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>{t.sell}</span>
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>{t.cart}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>{t.orders}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t.allCategories} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.allCategories}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {productsLoading ? (
              <div className="text-center py-8">{t.loading}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t.noProducts}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.imageUrls && product.imageUrls.length > 0 && (
                      <div className="h-48 bg-gray-200 dark:bg-gray-700">
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{product.price}
                        </span>
                        <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                          {product.quantity > 0 ? 
                            `${product.quantity} ${product.unit}` : 
                            t.outOfStock
                          }
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.quantity === 0 || addToCartMutation.isPending}
                          className="flex-1"
                        >
                          {t.addToCart}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          {t.buyNow}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sell" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t.myProducts}</h2>
              {isAuthenticated && (
                <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>{t.addProduct}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t.addProduct}</DialogTitle>
                      <DialogDescription>
                        Create a new product listing
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleCreateProduct)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.productName}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.description}</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.price}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                                <FormLabel>{t.quantity}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.category}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.unit}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="L">L</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="pieces">pieces</SelectItem>
                                    <SelectItem value="bags">bags</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t.uploadImage}</label>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880} // 5MB
                            onGetUploadParameters={handleGetUploadParameters}
                            onComplete={handleUploadComplete}
                            buttonClassName="w-full"
                          >
                            <div className="flex items-center space-x-2">
                              <Upload className="h-4 w-4" />
                              <span>{t.uploadImage}</span>
                            </div>
                          </ObjectUploader>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={createProductMutation.isPending}
                        >
                          {createProductMutation.isPending ? t.loading : t.createProduct}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="text-center py-8 text-gray-500">
                Please login to manage your products
              </div>
            ) : userProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t.noProducts}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.imageUrls && product.imageUrls.length > 0 && (
                      <div className="h-48 bg-gray-200 dark:bg-gray-700">
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{product.price}
                        </span>
                        <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                          {product.quantity > 0 ? 
                            `${product.quantity} ${product.unit}` : 
                            t.outOfStock
                          }
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {product.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            {!isAuthenticated ? (
              <div className="text-center py-8 text-gray-500">
                Please login to view your cart
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t.cartEmpty}</div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        {item.product.imageUrls && item.product.imageUrls.length > 0 && (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded">
                            <img
                              src={item.product.imageUrls[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            ₹{item.product.price} per {item.product.unit}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-semibold">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>{t.totalAmount}</span>
                      <span>₹{totalCartAmount.toFixed(2)}</span>
                    </div>
                    <Button className="w-full mt-4" size="lg">
                      {t.checkout}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              Order management coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}