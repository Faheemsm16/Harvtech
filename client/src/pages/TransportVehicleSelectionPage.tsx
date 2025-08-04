import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Truck, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { TransportVehicle } from "@shared/schema";

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
}

export default function TransportVehicleSelectionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<TransportVehicle | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);

  // Load booking data from sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem('transportBookingData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setBookingData(data);
      
      // Calculate distance between pickup and drop
      if (data.pickupLocation && data.dropLocation) {
        calculateDistance(data.pickupLocation, data.dropLocation);
      }
    } else {
      // Redirect back if no booking data
      setLocation('/transport-booking');
    }
  }, [setLocation]);

  // Fetch available vehicles
  const { data: vehicles = [], isLoading } = useQuery<TransportVehicle[]>({
    queryKey: ['/api/transport/vehicles'],
  });

  const calculateDistance = (pickup: any, drop: any) => {
    // Haversine formula to calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = (parseFloat(drop.latitude) - parseFloat(pickup.latitude)) * Math.PI / 180;
    const dLon = (parseFloat(drop.longitude) - parseFloat(pickup.longitude)) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(parseFloat(pickup.latitude) * Math.PI / 180) * Math.cos(parseFloat(drop.latitude) * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    setEstimatedDistance(Math.round(distance));
  };

  const calculateCost = (vehicle: TransportVehicle) => {
    return Math.round(estimatedDistance * vehicle.pricePerKm);
  };

  const handleVehicleSelect = (vehicle: TransportVehicle) => {
    if (!bookingData) return;
    
    const cost = calculateCost(vehicle);
    const updatedBookingData = {
      ...bookingData,
      selectedVehicle: vehicle,
      totalDistance: estimatedDistance.toString(),
      totalCost: cost,
      estimatedTime: vehicle.estimatedTime || `${Math.round(estimatedDistance / 40)} hours`, // Assume 40km/h average
    };
    
    sessionStorage.setItem('transportBookingData', JSON.stringify(updatedBookingData));
    setLocation('/transport-payment');
  };

  const handleBack = () => {
    setLocation('/transport-booking');
  };

  const getVehicleIcon = (vehicleType: string) => {
    // You can customize icons based on vehicle type
    return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100";
  };

  if (!bookingData) {
    return <div>Loading...</div>;
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
            <h2 className="text-lg font-semibold">Select Vehicle</h2>
            <p className="text-sm opacity-90">Step 2: Choose your transport</p>
          </div>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="p-6 bg-white border-b">
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
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span><MapPin className="h-4 w-4 inline mr-1" />{estimatedDistance} km</span>
            <span>Load: {bookingData.loadQuantity} {bookingData.loadUnit}</span>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 p-6">
        <h3 className="text-lg font-semibold mb-4">Available Vehicles</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ag-green mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No vehicles available at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    {/* Vehicle Image */}
                    <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4">
                      <img
                        src={vehicle.imageUrl || getVehicleIcon(vehicle.vehicleType)}
                        alt={vehicle.vehicleName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Vehicle Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{vehicle.vehicleName}</h4>
                      <p className="text-sm text-gray-600">{vehicle.vehicleType}</p>
                      <p className="text-xs text-gray-500">Capacity: {vehicle.capacity}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-semibold text-ag-green">
                            ₹{calculateCost(vehicle)}
                          </span>
                          <span className="flex items-center text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {vehicle.estimatedTime || `${Math.round(estimatedDistance / 40)}h`}
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => handleVehicleSelect(vehicle)}
                          className="bg-ag-green hover:bg-ag-green/90 text-white"
                          size="sm"
                        >
                          Select
                        </Button>
                      </div>
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