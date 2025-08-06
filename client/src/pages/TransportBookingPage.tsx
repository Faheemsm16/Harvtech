import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Navigation, Truck, Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      // Always use demo mode since Google Maps API key is not available
      console.log('Using demo mode for map functionality');
      setIsMapLoaded(true);
      // Auto-set current location in demo mode
      getCurrentLocation();
      return;

      try {
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

        // Initialize places services
        const autoService = new window.google.maps.places.AutocompleteService();
        const placesServiceInstance = new window.google.maps.places.PlacesService(mapInstance);
        setAutocompleteService(autoService);
        setPlacesService(placesServiceInstance);

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
                  
                  toast({
                    title: "Pickup Location Set",
                    description: address,
                  });
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
                  
                  toast({
                    title: "Drop Location Set",
                    description: address,
                  });
                }
              }
            });
          }
        });

        // Auto-get current location when map loads
        getCurrentLocation();
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsMapLoaded(true);
        getCurrentLocation();
      }
    };

    // Load Google Maps script if not already loaded
    if (typeof window.google === "undefined") {
      const script = document.createElement("script");
      // Note: Using demo mode since API key is not available
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDummy_Key_Replace_With_Real_Key&libraries=places`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => {
        console.log('Google Maps failed to load, using demo mode');
        setIsMapLoaded(true);
        getCurrentLocation();
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map && window.google) {
            const latLng = new window.google.maps.LatLng(latitude, longitude);
            map.setCenter(latLng);
            map.setZoom(15);
            
            // Automatically set as pickup location if not set
            if (!pickupLocation.address) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: latLng }, (results: any, status: any) => {
                if (status === "OK" && results && results[0]) {
                  const address = results[0].formatted_address;
                  
                  if (pickupMarker) pickupMarker.setMap(null);
                  const marker = new window.google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: "Current Location (Pickup)",
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
                  setPickupLocation({ 
                    latitude: latitude.toString(), 
                    longitude: longitude.toString(), 
                    address 
                  });
                  
                  toast({
                    title: "Current Location Detected",
                    description: "Set as pickup location: " + address,
                  });
                }
              });
            }
          } else {
            // Demo mode - set mock current location
            const mockAddress = "Current Location, Bangalore, Karnataka, India";
            setPickupLocation({
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: mockAddress
            });
            
            toast({
              title: "Location Detected",
              description: "Current location set as pickup: " + mockAddress,
            });
          }
        },
        (error) => {
          // Fallback to demo location
          const demoLocation = {
            latitude: "12.9716",
            longitude: "77.5946",
            address: "Demo Location, Bangalore, Karnataka, India"
          };
          
          setPickupLocation(demoLocation);
          
          if (map && window.google) {
            const latLng = new window.google.maps.LatLng(12.9716, 77.5946);
            map.setCenter(latLng);
            map.setZoom(13);
          }
          
          toast({
            title: "Demo Location Set",
            description: "Demo location set as pickup. Tap on map to change.",
          });
        }
      );
    } else {
      // Fallback for browsers without geolocation
      const demoLocation = {
        latitude: "12.9716",
        longitude: "77.5946",
        address: "Demo Location, Bangalore, Karnataka, India"
      };
      
      setPickupLocation(demoLocation);
      
      toast({
        title: "Demo Location Set",
        description: "Demo location set as pickup. Tap on map to change.",
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

  const handleLocationSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Location",
        description: "Please enter a location to search.",
        variant: "destructive",
      });
      return;
    }

    if (window.google && autocompleteService && placesService) {
      // Use Google Places API for search
      const request = {
        input: searchQuery,
        componentRestrictions: { country: 'in' }, // Restrict to India
      };

      autocompleteService.getPlacePredictions(request, (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions[0]) {
          const placeId = predictions[0].place_id;
          
          placesService.getDetails({ placeId }, (place: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              const address = place.formatted_address;
              
              // Center map on searched location
              const latLng = new window.google.maps.LatLng(lat, lng);
              map.setCenter(latLng);
              map.setZoom(15);
              
              toast({
                title: "Location Found",
                description: `Showing: ${address}`,
              });
            }
          });
        } else {
          toast({
            title: "Location Not Found",
            description: "Could not find the specified location. Please try a different search.",
            variant: "destructive",
          });
        }
      });
    } else {
      // Demo mode search - simulate search results
      const demoLocations = [
        { query: "chennai", lat: 13.0827, lng: 80.2707, address: "Chennai, Tamil Nadu, India" },
        { query: "coimbatore", lat: 11.0168, lng: 76.9558, address: "Coimbatore, Tamil Nadu, India" },
        { query: "madurai", lat: 9.9252, lng: 78.1198, address: "Madurai, Tamil Nadu, India" },
        { query: "salem", lat: 11.6643, lng: 78.1460, address: "Salem, Tamil Nadu, India" },
        { query: "trichy", lat: 10.7905, lng: 78.7047, address: "Tiruchirappalli, Tamil Nadu, India" },
        { query: "vellore", lat: 12.9165, lng: 79.1325, address: "Vellore, Tamil Nadu, India" },
        { query: "bangalore", lat: 12.9716, lng: 77.5946, address: "Bangalore, Karnataka, India" },
      ];
      
      const foundLocation = demoLocations.find(loc => 
        loc.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().includes(loc.query)
      );
      
      if (foundLocation) {
        toast({
          title: "Location Found",
          description: `Showing: ${foundLocation.address}`,
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Try searching for cities like Chennai, Coimbatore, Madurai, etc.",
          variant: "destructive",
        });
      }
    }
    
    setSearchQuery("");
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
        {/* Search Bar */}
        <div className="p-4 bg-white border-b">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for a location (e.g., Chennai, Coimbatore)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleLocationSearch}
              className="bg-ag-green hover:bg-ag-green/90 text-white"
              size="sm"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Interactive Map Container */}
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
          {/* Map Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '15px 15px'
            }}
          />
          
          {/* Route Path */}
          {pickupLocation.address && dropLocation.address && (
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
              <path
                d="M 20% 30% Q 50% 10% 80% 70%"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
            </svg>
          )}
          
          {/* Pickup Location Marker */}
          {pickupLocation.address && (
            <div 
              className="absolute bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white"
              style={{ top: '25%', left: '15%' }}
            >
              <MapPin className="h-5 w-5" />
            </div>
          )}
          
          {/* Drop Location Marker */}
          {dropLocation.address && (
            <div 
              className="absolute bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white"
              style={{ top: '65%', left: '75%' }}
            >
              <MapPin className="h-5 w-5" />
            </div>
          )}
          
          {/* Truck Animation */}
          {pickupLocation.address && dropLocation.address && (
            <div 
              className="absolute bg-blue-500 text-white rounded-lg p-1 shadow-lg border border-white transition-all duration-1000"
              style={{ 
                top: '45%', 
                left: '45%',
                transform: 'rotate(25deg)'
              }}
            >
              <Truck className="h-4 w-4" />
            </div>
          )}
          
          {/* Location Labels */}
          {pickupLocation.address && (
            <div className="absolute bg-white rounded-md shadow-md p-1 text-xs max-w-24 text-center border border-green-200" style={{ top: '35%', left: '5%' }}>
              Pickup
            </div>
          )}
          
          {dropLocation.address && (
            <div className="absolute bg-white rounded-md shadow-md p-1 text-xs max-w-24 text-center border border-red-200" style={{ top: '75%', left: '65%' }}>
              Drop
            </div>
          )}
          
          {/* Map Status */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 border border-blue-200">
            <div className="flex items-center space-x-2">
              {!pickupLocation.address && !dropLocation.address ? (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-600">Set locations</span>
                </>
              ) : pickupLocation.address && !dropLocation.address ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Add drop location</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Route ready</span>
                </>
              )}
            </div>
          </div>
          
          {/* Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            className="absolute bottom-4 right-4 bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Current Location
          </Button>
          
          {/* Demo Mode Label */}
          <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-1 border border-gray-200">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-600">Interactive Map</span>
            </div>
          </div>
          
          {/* Location Type Toggle */}
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <Button
              variant={isSettingPickup ? "default" : "outline"}
              onClick={() => setIsSettingPickup(true)}
              className={`shadow-lg ${isSettingPickup ? 'bg-ag-green text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              size="sm"
            >
              Set Pickup
            </Button>
            <Button
              variant={!isSettingPickup ? "default" : "outline"}
              onClick={() => setIsSettingPickup(false)}
              className={`shadow-lg ${!isSettingPickup ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              size="sm"
            >
              Set Drop
            </Button>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <p className="text-xs text-gray-700">
              {isSettingPickup ? "🟢 Tap map to set pickup location" : "🔴 Tap map to set drop location"}
            </p>
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
                {pickupLocation.address || "Search above or tap on map to set pickup location"}
              </div>
              {pickupLocation.address && (
                <div className="text-xs text-gray-500 mt-1">
                  {pickupLocation.latitude}, {pickupLocation.longitude}
                </div>
              )}
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={() => handleManualLocationSet(true)}
                  variant="outline"
                  size="sm"
                >
                  Demo: Bangalore
                </Button>
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Use Current
                </Button>
              </div>
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
                {dropLocation.address || "Search above or tap on map to set drop location"}
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
                Demo: Chennai
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