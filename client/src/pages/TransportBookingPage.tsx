import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Navigation, Truck } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Declare Google Maps types to avoid TypeScript errors
declare global {
  interface Window {
    google: any;
  }
}

interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
}

export default function TransportBookingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [pickupMarker, setPickupMarker] = useState<any>(null);
  const [dropMarker, setDropMarker] = useState<any>(null);
  
  const [pickupLocation, setPickupLocation] = useState<LocationData>({ latitude: "", longitude: "", address: "" });
  const [dropLocation, setDropLocation] = useState<LocationData>({ latitude: "", longitude: "", address: "" });
  const [loadQuantity, setLoadQuantity] = useState("");
  const [loadUnit, setLoadUnit] = useState("");
  const [isSettingPickup, setIsSettingPickup] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.google) {
        console.error('Google Maps not loaded');
        return;
      }

      // Default to Bangalore, India
      const defaultCenter = { lat: 12.9716, lng: 77.5946 };
      
      const mapInstance = new window.google.maps.Map(mapRef.current!, {
        zoom: 13,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);
      setIsMapLoaded(true);

      // Add click listener to set markers
      mapInstance.addListener("click", (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat().toString();
          const lng = event.latLng.lng().toString();
          
          // Get address from coordinates
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: event.latLng }, (results: any, status: any) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              
              if (isSettingPickup) {
                // Set pickup location
                if (pickupMarker) pickupMarker.setMap(null);
                const marker = new window.google.maps.Marker({
                  position: event.latLng!,
                  map: mapInstance,
                  title: "Pickup Location",
                  icon: {
                    url: "data:image/svg+xml," + encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22c55e"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                      </svg>
                    `)
                  }
                });
                setPickupMarker(marker);
                setPickupLocation({ latitude: lat, longitude: lng, address });
              } else {
                // Set drop location
                if (dropMarker) dropMarker.setMap(null);
                const marker = new window.google.maps.Marker({
                  position: event.latLng!,
                  map: mapInstance,
                  title: "Drop Location",
                  icon: {
                    url: "data:image/svg+xml," + encodeURIComponent(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                      </svg>
                    `)
                  }
                });
                setDropMarker(marker);
                setDropLocation({ latitude: lat, longitude: lng, address });
              }
            }
          });
        }
      });
    };

    // Load Google Maps script if not already loaded
    if (typeof window.google === "undefined") {
      const script = document.createElement("script");
      // Note: Replace with actual Google Maps API key
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDummy_Key_Replace_With_Real_Key&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [isSettingPickup]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLng = new window.google.maps.LatLng(latitude, longitude);
          
          if (map) {
            map.setCenter(latLng);
            map.setZoom(15);
            
            // Simulate a click at current location
            window.google.maps.event.trigger(map, 'click', { latLng });
          }
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please set manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    if (!pickupLocation.address || !dropLocation.address || !loadQuantity || !loadUnit) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Store booking data in sessionStorage to pass between pages
    const bookingData = {
      pickupLocation,
      dropLocation,
      loadQuantity,
      loadUnit,
    };
    sessionStorage.setItem('transportBookingData', JSON.stringify(bookingData));
    
    setLocation('/transport-vehicle-selection');
  };

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const handleManualLocationSet = (isPickup: boolean) => {
    // For demo purposes without Google Maps API key, set mock locations
    const mockPickup = {
      latitude: "12.9716",
      longitude: "77.5946",
      address: "Bangalore, Karnataka, India"
    };
    
    const mockDrop = {
      latitude: "13.0827",
      longitude: "80.2707",
      address: "Chennai, Tamil Nadu, India"
    };

    if (isPickup) {
      setPickupLocation(mockPickup);
    } else {
      setDropLocation(mockDrop);
    }
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
            <h2 className="text-lg font-semibold">Transport Booking</h2>
            <p className="text-sm opacity-90">Step 1: Pickup & Drop Location</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Map Container */}
        <div className="relative h-64 bg-gray-200">
          <div ref={mapRef} className="w-full h-full" />
          
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Loading Map...</p>
                <p className="text-xs text-gray-500 mt-2">
                  Demo mode: Use buttons below to set locations
                </p>
              </div>
            </div>
          )}
          
          {/* Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            className="absolute top-4 right-4 bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Current Location
          </Button>
          
          {/* Location Type Toggle */}
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <Button
              variant={isSettingPickup ? "default" : "outline"}
              onClick={() => setIsSettingPickup(true)}
              className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
              size="sm"
            >
              Set Pickup
            </Button>
            <Button
              variant={!isSettingPickup ? "default" : "outline"}
              onClick={() => setIsSettingPickup(false)}
              className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
              size="sm"
            >
              Set Drop
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 p-6 space-y-6">
          {/* Pickup Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Pickup Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-2">
                {pickupLocation.address || "Tap on map to set pickup location"}
              </div>
              {pickupLocation.address && (
                <div className="text-xs text-gray-500 mt-1">
                  {pickupLocation.latitude}, {pickupLocation.longitude}
                </div>
              )}
              <Button
                onClick={() => handleManualLocationSet(true)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Set Demo Pickup Location
              </Button>
            </CardContent>
          </Card>

          {/* Drop Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Drop Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-2">
                {dropLocation.address || "Tap on map to set drop location"}
              </div>
              {dropLocation.address && (
                <div className="text-xs text-gray-500 mt-1">
                  {dropLocation.latitude}, {dropLocation.longitude}
                </div>
              )}
              <Button
                onClick={() => handleManualLocationSet(false)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Set Demo Drop Location
              </Button>
            </CardContent>
          </Card>

          {/* Load Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Truck className="h-4 w-4" />
                <span>Load Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loadQuantity">Load Quantity *</Label>
                <Input
                  id="loadQuantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={loadQuantity}
                  onChange={(e) => setLoadQuantity(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="loadUnit">Unit *</Label>
                <Select onValueChange={setLoadUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">KG (Kilograms)</SelectItem>
                    <SelectItem value="Quintal">Quintal</SelectItem>
                    <SelectItem value="Ton">Ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-3 font-semibold"
            disabled={!pickupLocation.address || !dropLocation.address || !loadQuantity || !loadUnit}
          >
            Continue to Vehicle Selection
          </Button>
        </div>
      </div>
    </div>
  );
}