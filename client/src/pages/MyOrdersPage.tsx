import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useCustomAuth } from '@/context/AuthContext';

interface OrderWithItems {
  id: string;
  orderNumber: string;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryName: string;
  deliveryMobile: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    productPrice: number;
    quantity: number;
    sellerName: string;
    category: string;
  }>;
}

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/my-orders'],
    enabled: !!user,
  });

  const handleBack = () => {
    if (user?.role === 'owner') {
      setLocation('/owner-dashboard');
    } else {
      setLocation('/user-dashboard');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h2 className="text-lg font-semibold">My Orders</h2>
            <p className="text-sm opacity-90">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Your marketplace orders will appear here</p>
            <Button 
              onClick={() => setLocation('/marketplace/buy')}
              className="bg-ag-green hover:bg-ag-green/90 text-white"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        Payment: {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.productName}</p>
                            <p className="text-xs text-gray-600">Seller: {item.sellerName}</p>
                            <p className="text-xs text-gray-500">Category: {item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Qty: {item.quantity}</p>
                            <p className="font-semibold">₹{item.productPrice * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="font-medium">{order.deliveryName}</p>
                      <p>{order.deliveryMobile}</p>
                      <p>{order.deliveryAddress}</p>
                      <p>{order.deliveryCity}, {order.deliveryState} - {order.deliveryPincode}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Subtotal</span>
                      <span className="text-sm">₹{order.totalAmount - order.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Delivery Fee</span>
                      <span className="text-sm">₹{order.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Amount</span>
                      <span className="text-ag-green">₹{order.totalAmount}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Payment Method: {order.paymentMethod.toUpperCase()}
                    </div>
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