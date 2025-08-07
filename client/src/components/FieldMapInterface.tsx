import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

interface FieldMapInterfaceProps {
  onFieldAnalytics: (field: Field) => void;
  onWeatherAnalysis: (field: Field) => void;
}

export function FieldMapInterface({ onFieldAnalytics, onWeatherAnalysis }: FieldMapInterfaceProps) {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [showSatelliteInstructions, setShowSatelliteInstructions] = useState(false);
  const [showManualDraw, setShowManualDraw] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingCoords, setTrackingCoords] = useState<Array<{lat: number, lng: number}>>([]);
  const [fieldName, setFieldName] = useState("");
  const [savedFields, setSavedFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [currentDraw, setCurrentDraw] = useState<any>(null);

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
          const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 5); // Center on India

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
            setShowSaveDialog(true);
          });

          return () => {
            map.remove();
          };
        });
      });
    }
  }, [showManualDraw]);

  // GPS tracking simulation for satellite mapping
  const startSatelliteMapping = () => {
    setShowSatelliteInstructions(false);
    setIsTracking(true);
    setTrackingCoords([]);

    // Simulate GPS tracking with mock coordinates around a field
    const baseCoords = { lat: 20.5937, lng: 78.9629 };
    let pointCount = 0;

    const interval = setInterval(() => {
      const newCoord = {
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.002,
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.002
      };
      
      setTrackingCoords(prev => [...prev, newCoord]);
      pointCount++;

      if (pointCount >= 20) { // Stop after 20 points
        clearInterval(interval);
        setIsTracking(false);
        setShowSaveDialog(true);
      }
    }, 2000); // Add point every 2 seconds
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
    setTrackingCoords([]);
    setCurrentDraw(null);
    setShowManualDraw(false);
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
        >
          {!showManualDraw && (
            <div className="text-center">
              <MapIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Interactive Field Map</p>
            </div>
          )}
        </div>

        {/* Tracking overlay */}
        {isTracking && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="animate-pulse h-4 w-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="font-semibold">GPS Tracking Active</p>
              <p className="text-sm text-gray-600">Points collected: {trackingCoords.length}</p>
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
          <Button 
            onClick={() => setShowAddField(true)}
            className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => onFieldAnalytics(selectedField)}
              className="bg-ag-green hover:bg-ag-green/90 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Crop Monitoring
            </Button>
            <Button 
              onClick={() => onWeatherAnalysis(selectedField)}
              variant="outline"
              className="border-ag-green text-ag-green hover:bg-ag-green/10"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Weather
            </Button>
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      <Dialog open={showAddField} onOpenChange={setShowAddField}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              onClick={() => {
                setShowAddField(false);
                setShowSatelliteInstructions(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Satellite className="h-4 w-4 mr-2" />
              Satellite Mapping
            </Button>
            <Button 
              onClick={() => {
                setShowAddField(false);
                setShowManualDraw(true);
              }}
              variant="outline"
              className="w-full"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Draw Map Manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Satellite Instructions Modal */}
      <Dialog open={showSatelliteInstructions} onOpenChange={setShowSatelliteInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Field Mapping Instructions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-ag-green text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Position the Tractor</h4>
                  <p className="text-sm text-gray-600">Place your tractor at the starting point of the field where you want the automated path to begin.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-ag-green text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Keep Mobile Phone Close</h4>
                  <p className="text-sm text-gray-600">Ensure your mobile phone is close to the tractor for accurate GPS tracking during the mapping process.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-ag-green text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Start Engine & Drive</h4>
                  <p className="text-sm text-gray-600">After pressing "Start", start the tractor and drive it across the field exactly how you want it to be automated in the future.</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={startSatelliteMapping}
              className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Field Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Enter field name"
              />
            </div>
            <Button 
              onClick={saveField}
              className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Field
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}