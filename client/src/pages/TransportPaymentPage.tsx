import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle, MapPin, Truck, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface BookingData {
  pickupLocation: {
    latitude: string;
    longitude: string;
    address: string;
  };
  dropLocation: {
    latitude: string;
    longitude: string;
    address: string;
  };
  loadQuantity: string;
  loadUnit: string;
  selectedVehicle: any;
  totalDistance: string;
  totalCost: number;
  estimatedTime: string;
}

export default function TransportPaymentPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // Load booking data from sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem('transportBookingData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setBookingData(data);
    } else {
      // Redirect back if no booking data
      setLocation('/transport-booking');
    }
  }, [setLocation]);

  const bookingMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/transport/bookings', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transport/bookings'] });
      setIsBookingConfirmed(true);
      
      // Clear session storage
      sessionStorage.removeItem('transportBookingData');
      
      toast({
        title: "Booking Confirmed",
        description: "Your transport has been booked successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book transport. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConfirmBooking = () => {
    if (!bookingData || !paymentMethod || !user) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    const bookingPayload = {
      vehicleId: bookingData.selectedVehicle.id,
      pickupLatitude: bookingData.pickupLocation.latitude,
      pickupLongitude: bookingData.pickupLocation.longitude,
      pickupAddress: bookingData.pickupLocation.address,
      dropLatitude: bookingData.dropLocation.latitude,
      dropLongitude: bookingData.dropLocation.longitude,
      dropAddress: bookingData.dropLocation.address,
      loadQuantity: bookingData.loadQuantity,
      loadUnit: bookingData.loadUnit,
      totalDistance: bookingData.totalDistance,
      totalCost: bookingData.totalCost,
      estimatedTime: bookingData.estimatedTime,
      paymentMethod,
      paymentStatus: "paid", // Mock payment success
      bookingStatus: "confirmed",
    };

    bookingMutation.mutate(bookingPayload);
  };

  const handleBack = () => {
    setLocation('/transport-vehicle-selection');
  };

  const handleBackToHome = () => {
    if (user?.role === 'owner') {
      setLocation('/owner-dashboard');
    } else {
      setLocation('/user-dashboard');
    }
  };

  if (!bookingData) {
    return <div>Loading...</div>;
  }

  if (isBookingConfirmed) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-ag-green text-white p-6">
          <h2 className="text-lg font-semibold">Booking Confirmed</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transport Booked!</h3>
              <p className="text-gray-600 mb-6">
                Your {bookingData.selectedVehicle.vehicleName} has been booked successfully. 
                The driver will contact you shortly.
              </p>
              
              <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-medium">{bookingData.selectedVehicle.vehicleName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span className="font-medium">{bookingData.totalDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span className="font-medium">{bookingData.loadQuantity} {bookingData.loadUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-medium text-ag-green">₹{bookingData.totalCost}</span>
                </div>
              </div>
              
              <Button onClick={handleBackToHome} className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
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
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-sm opacity-90">Step 3: Confirm & Pay</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vehicle Details */}
            <div className="flex items-center space-x-3">
              <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={bookingData.selectedVehicle.imageUrl || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"}
                  alt={bookingData.selectedVehicle.vehicleName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{bookingData.selectedVehicle.vehicleName}</h4>
                <p className="text-sm text-gray-600">{bookingData.selectedVehicle.vehicleType}</p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pickup</p>
                  <p className="text-xs text-gray-600">{bookingData.pickupLocation.address}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Drop</p>
                  <p className="text-xs text-gray-600">{bookingData.dropLocation.address}</p>
                </div>
              </div>
            </div>

            {/* Trip Info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{bookingData.totalDistance} km</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{bookingData.estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4 text-gray-500" />
                <span>{bookingData.loadQuantity} {bookingData.loadUnit}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="UPI" id="upi" />
                <Label htmlFor="upi" className="flex items-center space-x-3 flex-1 cursor-pointer">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span>UPI Payment</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="Card" id="card" />
                <Label htmlFor="card" className="flex items-center space-x-3 flex-1 cursor-pointer">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Credit/Debit Card</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="Wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center space-x-3 flex-1 cursor-pointer">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <span>Digital Wallet</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Base Fare ({bookingData.totalDistance} km × ₹{bookingData.selectedVehicle.pricePerKm}/km)</span>
              <span>₹{bookingData.totalCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Tax</span>
              <span>₹0</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span className="text-ag-green">₹{bookingData.totalCost}</span>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmBooking}
          disabled={!paymentMethod || bookingMutation.isPending}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-3 font-semibold"
        >
          {bookingMutation.isPending ? "Processing..." : `Confirm & Pay ₹${bookingData.totalCost}`}
        </Button>
      </div>
    </div>
  );
}