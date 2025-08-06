import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Navigation, Warehouse, Phone, User, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Warehouse as WarehouseType } from "@shared/schema";

interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
}

export default function WarehousePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState("");

  // Get current location automatically on page load
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Fetch warehouses when we have a location
  const { data: warehouses = [], isLoading: warehousesLoading } = useQuery<WarehouseType[]>({
    queryKey: ['/api/warehouses'],
    enabled: showWarehouses && currentLocation !== null,
  });

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use coordinates as address if geocoding is not available
          const coordinateAddress = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          
          setCurrentLocation({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: coordinateAddress
          });
          
          setIsGettingLocation(false);
          
          toast({
            title: "Location Detected",
            description: "Your current location has been detected successfully.",
          });
        },
        (error) => {
          setIsGettingLocation(false);
          
          toast({
            title: "Location Access Denied",
            description: "Please allow location access to find nearby warehouses, or contact us for assistance.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsGettingLocation(false);
      
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services. Please enter your location manually below.",
        variant: "destructive",
      });
    }
  };

  const handleManualLocationSet = () => {
    if (!manualLocation.trim()) {
      toast({
        title: "Invalid Location",
        description: "Please enter a valid location name.",
        variant: "destructive",
      });
      return;
    }

    setCurrentLocation({
      latitude: "",
      longitude: "",
      address: manualLocation.trim()
    });

    toast({
      title: "Location Set",
      description: `Location set to: ${manualLocation.trim()}`,
    });

    setManualLocation("");
  };

  const handleOkClick = () => {
    if (!currentLocation || !quantity || !unit) {
      toast({
        title: "Missing Information",
        description: "Please ensure location is detected and enter quantity with unit.",
        variant: "destructive",
      });
      return;
    }

    setShowWarehouses(true);
    toast({
      title: "Searching Warehouses",
      description: "Looking for nearby warehouses based on your requirements.",
    });
  };

  const handleBack = () => {
    setLocation('/marketplace');
  };

  const calculateDistance = (warehouse: WarehouseType) => {
    if (!currentLocation) return 0;
    
    // Haversine formula to calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = (parseFloat(warehouse.latitude) - parseFloat(currentLocation.latitude)) * Math.PI / 180;
    const dLon = (parseFloat(warehouse.longitude) - parseFloat(currentLocation.longitude)) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(parseFloat(currentLocation.latitude) * Math.PI / 180) * Math.cos(parseFloat(warehouse.latitude) * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const getFacilitiesArray = (facilities: string | null) => {
    if (!facilities) return [];
    try {
      return JSON.parse(facilities);
    } catch {
      return facilities.split(',').map(f => f.trim());
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
            <h2 className="text-lg font-semibold">Warehouse Storage</h2>
            <p className="text-sm opacity-90">Find storage solutions for your crops</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Current Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <MapPin className="h-5 w-5 text-ag-green" />
              <span>Current Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGettingLocation ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ag-green"></div>
                <span>Detecting location...</span>
              </div>
            ) : currentLocation ? (
              <div>
                <p className="text-sm text-gray-700 mb-2">{currentLocation.address}</p>
                <p className="text-xs text-gray-500">
                  {currentLocation.latitude}, {currentLocation.longitude}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Location not available</p>
            )}
            
            <div className="mt-3 space-y-2">
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                size="sm"
                disabled={isGettingLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isGettingLocation ? "Getting Location..." : "Refresh Location"}
              </Button>
              
              {/* Manual Location Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Or enter your location manually (e.g., Chennai, Tamil Nadu)"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSet()}
                  className="text-sm"
                />
                <Button
                  onClick={handleManualLocationSet}
                  variant="outline"
                  size="sm"
                  disabled={!manualLocation.trim()}
                >
                  Set
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Warehouse className="h-5 w-5 text-ag-green" />
              <span>Storage Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quintal">Quintal</SelectItem>
                  <SelectItem value="Ton">Ton</SelectItem>
                  <SelectItem value="KG">KG (Kilograms)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleOkClick}
              className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
              disabled={!currentLocation || !quantity || !unit}
            >
              Find Nearby Warehouses
            </Button>
          </CardContent>
        </Card>

        {/* Warehouse List */}
        {showWarehouses && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nearby Warehouses</CardTitle>
              <p className="text-sm text-gray-600">
                Storage required: {quantity} {unit}
              </p>
            </CardHeader>
            <CardContent>
              {warehousesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ag-green mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading warehouses...</p>
                </div>
              ) : warehouses.length === 0 ? (
                <div className="text-center py-8">
                  <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No warehouses available in your area</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your location or check back later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {warehouses
                    .sort((a, b) => calculateDistance(a) - calculateDistance(b))
                    .map((warehouse) => (
                    <div key={warehouse.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{warehouse.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{warehouse.address}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {calculateDistance(warehouse)} km away
                            </span>
                            <span className="text-ag-green font-medium">
                              {warehouse.warehouseType}
                            </span>
                          </div>
                        </div>
                        {warehouse.imageUrl && (
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden ml-3">
                            <img
                              src={warehouse.imageUrl}
                              alt={warehouse.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Capacity:</span>
                          <span className="ml-1 font-medium">{warehouse.capacity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Available:</span>
                          <span className="ml-1 font-medium">{warehouse.availableSpace}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1 font-medium text-ag-green">
                            ₹{warehouse.pricePerUnit}/{warehouse.priceUnit}/month
                          </span>
                        </div>
                        {warehouse.ownerName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-gray-600">{warehouse.ownerName}</span>
                          </div>
                        )}
                      </div>

                      {warehouse.facilities && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Facilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {getFacilitiesArray(warehouse.facilities).map((facility: string, index: number) => (
                              <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {warehouse.contactNumber && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{warehouse.contactNumber}</span>
                          </div>
                        )}
                        
                        <Button 
                          size="sm" 
                          className="bg-ag-green hover:bg-ag-green/90 text-white"
                          onClick={() => {
                            if (warehouse.contactNumber) {
                              // Open phone dialer with the warehouse contact number
                              window.location.href = `tel:${warehouse.contactNumber}`;
                            } else {
                              toast({
                                title: "Contact Information",
                                description: `No contact number available for ${warehouse.name}`,
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interactive Map View */}
        {showWarehouses && currentLocation && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <MapPin className="h-5 w-5 text-ag-green" />
                <span>Warehouse Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg h-64 relative overflow-hidden border-2 border-green-200">
                {/* Map Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* Current Location */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">Your Location</span>
                  </div>
                </div>
                
                {/* Warehouse Markers */}
                {warehouses.slice(0, 8).map((warehouse, index) => {
                  // Different positions for different warehouses based on their location in Tamil Nadu
                  const positions = [
                    { top: '25%', left: '35%' }, // Chennai area
                    { top: '15%', left: '15%' }, // Coimbatore area
                    { top: '55%', left: '25%' }, // Madurai area
                    { top: '20%', left: '50%' }, // Salem area
                    { top: '45%', left: '40%' }, // Tiruchirappalli area
                    { top: '30%', left: '60%' }, // Vellore area
                    { top: '65%', left: '50%' }, // Additional warehouse
                    { top: '75%', left: '20%' }  // Additional warehouse
                  ];
                  const position = positions[index % positions.length];
                  
                  return (
                    <div key={warehouse.id}>
                      {/* Warehouse Marker */}
                      <div 
                        className={`absolute text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform ${
                          warehouse.warehouseType === 'Government' ? 'bg-blue-600' :
                          warehouse.warehouseType === 'Cooperative' ? 'bg-green-600' :
                          'bg-orange-500'
                        }`}
                        style={position}
                        title={`${warehouse.name} - ${warehouse.warehouseType}`}
                      >
                        <Warehouse className="h-5 w-5" />
                      </div>
                      
                      {/* Warehouse Info Popup */}
                      <div 
                        className="absolute bg-white rounded-lg shadow-lg p-2 border border-gray-200 text-xs min-w-32 z-10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ 
                          top: `calc(${position.top} + 45px)`, 
                          left: position.left,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="font-semibold text-gray-800 truncate">{warehouse.name}</div>
                        <div className="text-gray-600">{warehouse.warehouseType}</div>
                        <div className="text-gray-600">{warehouse.availableSpace} available</div>
                        <div className="text-green-600 font-medium">₹{warehouse.pricePerUnit}/{warehouse.priceUnit}</div>
                        <div className="text-blue-600">{calculateDistance(warehouse)}km away</div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Distance Lines */}
                {warehouses.slice(0, 8).map((warehouse, index) => {
                  const positions = [
                    { top: '25%', left: '35%' },
                    { top: '15%', left: '15%' },
                    { top: '55%', left: '25%' },
                    { top: '20%', left: '50%' },
                    { top: '45%', left: '40%' },
                    { top: '30%', left: '60%' },
                    { top: '65%', left: '50%' },
                    { top: '75%', left: '20%' }
                  ];
                  const position = positions[index % positions.length];
                  
                  return (
                    <svg 
                      key={`line-${warehouse.id}`}
                      className="absolute inset-0 pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      <line
                        x1="10%"
                        y1="20%"
                        x2={position.left}
                        y2={position.top}
                        stroke={`rgba(${warehouse.warehouseType === 'Government' ? '59, 130, 246' : 
                                      warehouse.warehouseType === 'Cooperative' ? '34, 197, 94' : 
                                      '249, 115, 22'}, 0.4)`}
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    </svg>
                  );
                })}
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">Map Legend</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Your Location</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span>Government</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span>Cooperative</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Private</span>
                    </div>
                  </div>
                </div>
                
                {/* Distance Info */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 border border-green-200">
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">Nearest: {warehouses.length > 0 ? calculateDistance(warehouses[0]) : '0'}km</div>
                    <div>Total: {warehouses.length} warehouses</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}