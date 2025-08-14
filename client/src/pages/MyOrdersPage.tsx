import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';

interface OrderItem {
  id: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  product: {
    id: string;
    productName: string;
    category: string;
    imageUrls: string;
  };
  seller: {
    id: string;
    name: string;
    city: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  estimatedDelivery: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/marketplace/orders', user?.id],
    queryFn: () => apiRequest(`/api/marketplace/orders?buyerId=${user?.id}`),
    enabled: !!user?.id,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', completed: true },
      { status: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'shipped', 'delivered'].includes(status) },
      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
      { status: 'delivered', label: 'Delivered', completed: status === 'delivered' },
    ];

    if (status === 'cancelled') {
      return [
        { status: 'pending', label: 'Order Placed', completed: true },
        { status: 'cancelled', label: 'Order Cancelled', completed: true },
      ];
    }

    return steps;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6 pb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Navigate back to appropriate dashboard based on user role
              if (user?.role === 'owner') {
                setLocation('/owner-dashboard');
              } else {
                setLocation('/user-dashboard');
              }
            }}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">My Orders</h1>
        </div>
      </div>

      <div className="p-6 -mt-4">
        {orders.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Button
                onClick={() => setLocation('/marketplace/buy')}
                className="bg-ag-green hover:bg-ag-green/90 text-white"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</h3>
                      <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.orderStatus)} flex items-center space-x-1`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </Badge>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.productName}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × {formatCurrency(item.pricePerUnit)}
                          </p>
                          <p className="text-sm text-gray-500">Seller: {item.seller.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>Estimated delivery: {order.estimatedDelivery}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowTrackingModal(true);
                      }}
                      className="border-ag-green text-ag-green hover:bg-ag-green/10"
                    >
                      Track Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">
                  Order #{selectedOrder.id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">
                  Estimated delivery: {selectedOrder.estimatedDelivery}
                </p>
              </div>

              <div className="space-y-4">
                {getTrackingSteps(selectedOrder.orderStatus).map((step, index) => (
                  <div key={step.status} className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-ag-green text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.completed && (
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}