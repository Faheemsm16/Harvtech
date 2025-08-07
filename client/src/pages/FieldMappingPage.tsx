import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Map as MapIcon, 
  Satellite, 
  PenTool, 
  Play, 
  Save, 
  MapPin,
  Cloud,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

export default function FieldMappingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [showSatelliteInstructions, setShowSatelliteInstructions] = useState(false);
  const [showManualDraw, setShowManualDraw] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSaveOption, setShowSaveOption] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingCoords, setTrackingCoords] = useState<Array<{lat: number, lng: number}>>([]);
  const [fieldName, setFieldName] = useState("");
  const [savedFields, setSavedFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [currentDraw, setCurrentDraw] = useState<any>(null);
  const [tractorPosition, setTractorPosition] = useState<{lat: number, lng: number} | null>(null);
  const [tracedPath, setTracedPath] = useState<Array<{lat: number, lng: number}>>([]);
  const mapInstanceRef = useRef<any>(null);
  const tractorMarkerRef = useRef<any>(null);
  const pathPolylineRef = useRef<any>(null);

  // Load saved fields from localStorage
  useEffect(() => {
    const fields = JSON.parse(localStorage.getItem('harvtech_fields') || '[]');
    setSavedFields(fields);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (mapRef.current && typeof window !== 'undefined') {
      // Dynamic import Leaflet to avoid SSR issues
      import('leaflet').then((L) => {
        import('leaflet-draw').then(() => {
          // Create map if it doesn't exist
          if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 6); // Center on India
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add drawing controls for manual drawing
            const drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            const drawControl = new (L as any).Control.Draw({
              position: 'topright',
              draw: {
                polygon: true,
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false
              },
              edit: {
                featureGroup: drawnItems,
                remove: true
              }
            });

            if (showManualDraw) {
              map.addControl(drawControl);
            }

            map.on((L as any).Draw.Event.CREATED, (e: any) => {
              const layer = e.layer;
              drawnItems.addLayer(layer);
              setCurrentDraw(layer.toGeoJSON());
              setShowSaveOption(true);
            });
          }
        });
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showManualDraw]);

  // GPS tracking simulation with realistic path tracing
  const startSatelliteMapping = () => {
    setShowSatelliteInstructions(false);
    setIsTracking(true);
    setTrackingCoords([]);
    setTracedPath([]);

    // Dynamic import Leaflet for tractor animation
    import('leaflet').then((L) => {
      const baseCoords = { lat: 20.5937, lng: 78.9629 };
      const map = mapInstanceRef.current;
      
      if (map) {
        // Clear any existing path
        if (pathPolylineRef.current) {
          map.removeLayer(pathPolylineRef.current);
        }

        // Create custom tractor icon
        const tractorIcon = L.divIcon({
          html: '🚜',
          iconSize: [30, 30],
          className: 'tractor-icon'
        });

        // Add tractor marker
        const tractorMarker = L.marker([baseCoords.lat, baseCoords.lng], { 
          icon: tractorIcon 
        }).addTo(map);
        tractorMarkerRef.current = tractorMarker;

        // Center map on tractor
        map.setView([baseCoords.lat, baseCoords.lng], 15);

        let pointCount = 0;
        const radius = 0.003; // Smaller field radius for better visibility
        const coords: Array<{lat: number, lng: number}> = [];
        const pathCoords: Array<[number, number]> = [];

        // Create polyline for path tracing
        const pathPolyline = L.polyline([], {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(map);
        pathPolylineRef.current = pathPolyline;

        const interval = setInterval(() => {
          // Create realistic field boundary path (rectangular with rounded corners)
          let newCoord;
          const progress = pointCount / 20;
          
          if (progress <= 0.25) {
            // Top edge
            const edgeProgress = progress / 0.25;
            newCoord = {
              lat: baseCoords.lat + radius,
              lng: baseCoords.lng - radius + (2 * radius * edgeProgress)
            };
          } else if (progress <= 0.5) {
            // Right edge
            const edgeProgress = (progress - 0.25) / 0.25;
            newCoord = {
              lat: baseCoords.lat + radius - (2 * radius * edgeProgress),
              lng: baseCoords.lng + radius
            };
          } else if (progress <= 0.75) {
            // Bottom edge
            const edgeProgress = (progress - 0.5) / 0.25;
            newCoord = {
              lat: baseCoords.lat - radius,
              lng: baseCoords.lng + radius - (2 * radius * edgeProgress)
            };
          } else {
            // Left edge
            const edgeProgress = (progress - 0.75) / 0.25;
            newCoord = {
              lat: baseCoords.lat - radius + (2 * radius * edgeProgress),
              lng: baseCoords.lng - radius
            };
          }
          
          // Update tractor position
          tractorMarker.setLatLng([newCoord.lat, newCoord.lng]);
          setTractorPosition(newCoord);
          
          // Add to path and update traced path display
          coords.push(newCoord);
          pathCoords.push([newCoord.lat, newCoord.lng]);
          pathPolyline.setLatLngs(pathCoords);
          
          pointCount++;
          setTrackingCoords([...coords]);
          setTracedPath([...coords]);

          if (pointCount >= 20) {
            clearInterval(interval);
            setIsTracking(false);
            
            // Complete the field boundary by connecting to start
            pathCoords.push([coords[0].lat, coords[0].lng]);
            pathPolyline.setLatLngs(pathCoords);
            
            // Draw the final field polygon
            const fieldCoords: [number, number][] = coords.map(coord => [coord.lat, coord.lng] as [number, number]);
            fieldCoords.push([coords[0].lat, coords[0].lng] as [number, number]);
            
            L.polygon(fieldCoords, {
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.2,
              weight: 3
            }).addTo(map);
            
            // Show save dialog for satellite mapping
            setShowSaveDialog(true);
          }
        }, 1000); // Moderate speed for better visibility
      }
    });
  };

  const saveField = () => {
    if (!fieldName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a field name",
        variant: "destructive"
      });
      return;
    }

    let geoJson;
    if (trackingCoords.length > 0) {
      // Create GeoJSON from tracked coordinates
      geoJson = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...trackingCoords.map(coord => [coord.lng, coord.lat]), [trackingCoords[0].lng, trackingCoords[0].lat]]]
        },
        properties: { name: fieldName }
      };
    } else if (currentDraw) {
      geoJson = currentDraw;
      geoJson.properties = { name: fieldName };
    }

    const newField: Field = {
      id: Date.now().toString(),
      name: fieldName,
      geoJson,
      createdAt: new Date().toISOString()
    };

    const updatedFields = [...savedFields, newField];
    setSavedFields(updatedFields);
    localStorage.setItem('harvtech_fields', JSON.stringify(updatedFields));

    toast({
      title: "Field Saved",
      description: `Field "${fieldName}" has been saved successfully!`
    });

    // Reset state
    setFieldName("");
    setShowSaveDialog(false);
    setShowSaveOption(false);
    setTrackingCoords([]);
    setTracedPath([]);
    setCurrentDraw(null);
    setShowManualDraw(false);
    
    // Clean up tractor marker and path
    if (tractorMarkerRef.current) {
      tractorMarkerRef.current.remove();
      tractorMarkerRef.current = null;
    }
    if (pathPolylineRef.current) {
      mapInstanceRef.current.removeLayer(pathPolylineRef.current);
      pathPolylineRef.current = null;
    }
    
    // Clear map and show only saved field
    if (mapInstanceRef.current && geoJson) {
      import('leaflet').then((L) => {
        const map = mapInstanceRef.current;
        
        // Clear all layers except the base map
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Polygon || layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
          }
        });
        
        // Add only the saved field with exact coordinates
        const coords = geoJson.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        const polygon = L.polygon(coords, {
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 0.4,
          weight: 3,
          dashArray: '5, 5' // Dashed outline to show it's a saved field
        }).addTo(map);
        
        // Add a label for the saved field
        const center = polygon.getBounds().getCenter();
        L.marker(center, {
          icon: L.divIcon({
            html: `<div style="background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #22c55e; font-size: 12px; font-weight: bold; color: #22c55e;">${fieldName}</div>`,
            className: 'field-label',
            iconSize: [100, 20],
            iconAnchor: [50, 10]
          })
        }).addTo(map);
        
        // Fit map to show the field with some padding
        map.fitBounds(polygon.getBounds(), { padding: [20, 20] });
        
        // Show success message
        setTimeout(() => {
          toast({
            title: "Field Saved Successfully!",
            description: `Field "${fieldName}" has been saved with its exact boundary.`
          });
        }, 500);
      });
    }
  };

  const handleFieldAnalytics = (field: Field) => {
    setLocation(`/services/analytics/${field.id}`);
  };

  const handleWeatherAnalysis = (field: Field) => {
    setLocation(`/services/weather/${field.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-ag-green text-white p-4 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Field Mapping</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
            style={{ minHeight: '320px' }}
          >
          </div>

          {/* Satellite Instructions Overlay */}
          {showSatelliteInstructions && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg" style={{zIndex: 1000}}>
              <div className="bg-white p-4 rounded-lg max-w-sm mx-4">
                <h3 className="font-semibold mb-3">Field Mapping Instructions</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-ag-green text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p>Position your tractor at the starting point of the field</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-ag-green text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p>Keep your mobile phone close to the tractor for GPS tracking</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-ag-green text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p>Start the tractor and drive across the field boundary</p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    onClick={startSatelliteMapping}
                    className="flex-1 bg-ag-green hover:bg-ag-green/90 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                  <Button 
                    onClick={() => setShowSatelliteInstructions(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tracking overlay */}
          {isTracking && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg" style={{zIndex: 1000}}>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="animate-pulse h-4 w-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">GPS Tracking Active</p>
                <p className="text-sm text-gray-600">🚜 Tracing field boundary...</p>
                <p className="text-sm text-gray-600 font-medium">Path progress: {trackingCoords.length}/20 points</p>
                <div className="text-xs text-blue-600 mt-1">
                  {tracedPath.length > 0 && 'Blue line shows traced path'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-ag-green h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(trackingCoords.length / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Satellite Mapping Save Dialog */}
          {showSaveDialog && trackingCoords.length > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg" style={{zIndex: 1000}}>
              <div className="bg-white p-4 rounded-lg text-center max-w-sm mx-4">
                <h3 className="font-semibold mb-2">Field Boundary Traced!</h3>
                <p className="text-sm text-gray-600 mb-4">🚜 Satellite mapping completed successfully. Save your field boundary?</p>
                <div className="space-y-2">
                  <Input
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Enter field name"
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        if (fieldName.trim()) {
                          saveField();
                        } else {
                          toast({
                            title: "Error",
                            description: "Please enter a field name",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="flex-1 bg-ag-green hover:bg-ag-green/90 text-white"
                      disabled={!fieldName.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Field
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowSaveDialog(false);
                        setTrackingCoords([]);
                        setTracedPath([]);
                        setFieldName("");
                        
                        // Clean up the map
                        if (tractorMarkerRef.current && mapInstanceRef.current) {
                          mapInstanceRef.current.removeLayer(tractorMarkerRef.current);
                          tractorMarkerRef.current = null;
                        }
                        if (pathPolylineRef.current && mapInstanceRef.current) {
                          mapInstanceRef.current.removeLayer(pathPolylineRef.current);
                          pathPolylineRef.current = null;
                        }
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Draw Save Option */}
          {showSaveOption && currentDraw && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg" style={{zIndex: 1000}}>
              <div className="bg-white p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Field Boundary Created</h3>
                <p className="text-sm text-gray-600 mb-4">Your field boundary has been drawn successfully.</p>
                <div className="space-y-2">
                  <Input
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Enter field name"
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        if (fieldName.trim()) {
                          saveField();
                        } else {
                          toast({
                            title: "Error",
                            description: "Please enter a field name",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="flex-1 bg-ag-green hover:bg-ag-green/90 text-white"
                      disabled={!fieldName.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Field
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowSaveOption(false);
                        setCurrentDraw(null);
                        setFieldName("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Field Selection */}
        {savedFields.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Select Saved Field</Label>
              <Select onValueChange={(value) => {
                const field = savedFields.find(f => f.id === value);
                setSelectedField(field || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a field" />
                </SelectTrigger>
                <SelectContent>
                  {savedFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!selectedField ? (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setShowSatelliteInstructions(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Satellite className="h-5 w-5" />
                <span className="text-sm">Satellite Mapping</span>
              </Button>
              <Button 
                onClick={() => setShowManualDraw(true)}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <PenTool className="h-5 w-5" />
                <span className="text-sm">Draw Manually</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleFieldAnalytics(selectedField)}
                className="bg-ag-green hover:bg-ag-green/90 text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Crop Monitoring
              </Button>
              <Button 
                onClick={() => handleWeatherAnalysis(selectedField)}
                variant="outline"
                className="border-ag-green text-ag-green hover:bg-ag-green/10"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Weather
              </Button>
            </div>
          )}
          
          <Button 
            onClick={() => setLocation('/services/fields')}
            variant="outline"
            className="w-full"
          >
            View Saved Fields
          </Button>
        </div>
      </div>

    </div>
  );
}