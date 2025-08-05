import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// TODO: Add language context back when available
// import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMarketplaceOrderSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Smartphone, Wallet, Truck } from "lucide-react";
import { z } from "zod";
import type { CartItem, MarketplaceProduct } from "@shared/schema";
import { Link } from "wouter";

const orderFormSchema = insertMarketplaceOrderSchema.extend({
  shippingAddress: z.string().min(10, "Shipping address is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface CartItemWithProduct extends CartItem {
  product?: MarketplaceProduct;
}

export default function CartPage() {
  // const { t } = useLanguage(); // TODO: Add language context back
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showCheckout, setShowCheckout] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      shippingAddress: "",
      paymentMethod: "",
      orderStatus: "pending",
      paymentStatus: "pending",
    },
  });

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/cart'],
    enabled: isAuthenticated,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/marketplace/products'],
    select: (data) => data || [],
  });

  // Merge cart items with product details
  const cartWithProducts: CartItemWithProduct[] = cartItems.map((item: CartItem) => ({
    ...item,
    product: products.find((p: MarketplaceProduct) => p.id === item.productId)
  }));

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return await apiRequest(`/api/marketplace/cart/${productId}`, 'PUT', { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest(`/api/marketplace/cart/${productId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      const orderItems = cartWithProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.product?.pricePerUnit || 0,
        subtotal: (item.product?.pricePerUnit || 0) * item.quantity,
        sellerId: item.product?.sellerId || ''
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      return await apiRequest('/api/marketplace/orders', 'POST', {
        ...orderData,
        totalAmount,
        items: orderItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/orders'] });
      setShowCheckout(false);
      form.reset();
    },
  });

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItemMutation.mutate(productId);
  };

  const handleCreateOrder = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  const totalAmount = cartWithProducts.reduce((sum, item) => {
    return sum + (item.product?.pricePerUnit || 0) * item.quantity;
  }, 0);

  const totalItems = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Please log in</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You need to be logged in to view your cart
            </p>
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cartWithProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add some products to get started
            </p>
            <Link href="/marketplace">
              <Button className="bg-green-600 hover:bg-green-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartWithProducts.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={(item.product?.imageUrls && JSON.parse(item.product.imageUrls || '[]')[0]) || `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&h=150&fit=crop&crop=center`}
                        alt={item.product?.productName || "Product"}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {item.product?.productName || "Unknown Product"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {item.product?.productDescription || "No description available"}
                        </p>
                        <Badge variant="secondary" className="mb-2">
                          {item.product?.category || "Unknown"}
                        </Badge>
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-green-600">
                            ₹{((item.product?.pricePerUnit || 0) * item.quantity).toFixed(2)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={removeItemMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        <CreditCard className="mr-2" size={20} />
                        Proceed to Checkout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreateOrder)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="shippingAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Address</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Enter your full address"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="upi">
                                      <div className="flex items-center">
                                        <Smartphone className="mr-2" size={16} />
                                        UPI Payment
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="card">
                                      <div className="flex items-center">
                                        <CreditCard className="mr-2" size={16} />
                                        Debit/Credit Card
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="wallet">
                                      <div className="flex items-center">
                                        <Wallet className="mr-2" size={16} />
                                        Digital Wallet
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="cod">
                                      <div className="flex items-center">
                                        <Truck className="mr-2" size={16} />
                                        Cash on Delivery
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span>Total Amount:</span>
                              <span className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              type="submit" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              disabled={createOrderMutation.isPending}
                            >
                              {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowCheckout(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}