import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  TrendingUp, 
  MapPin, 
  Droplets,
  Bug,
  Leaf,
  Beaker,
  Mountain,
  ChevronDown
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

interface AnalysisOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  purpose: string;
  colorScheme: string;
}

const analysisOptions: AnalysisOption[] = [
  {
    id: "ndvi",
    title: "NDVI",
    description: "Normalized Difference Vegetation Index",
    icon: <Bug className="h-5 w-5" />,
    purpose: "Pest intensity heatmap for pest planning",
    colorScheme: "Red = High Pest Risk, Green = Healthy"
  },
  {
    id: "ndre", 
    title: "NDRE",
    description: "Normalized Difference Red Edge",
    icon: <Leaf className="h-5 w-5" />,
    purpose: "Plant health monitoring & yield prediction",
    colorScheme: "Green = Healthy Plants, Red = Stressed"
  },
  {
    id: "msavi",
    title: "MSAVI / RECI",
    description: "Modified Soil Adjusted Vegetation Index",
    icon: <Beaker className="h-5 w-5" />,
    purpose: "Fertilizer detection & management planning",
    colorScheme: "Blue = High Nutrients, Yellow = Low Nutrients"
  },
  {
    id: "ndmi",
    title: "NDMI", 
    description: "Normalized Difference Moisture Index",
    icon: <Droplets className="h-5 w-5" />,
    purpose: "Moisture detection & irrigation planning",
    colorScheme: "Blue = High Moisture, Red = Dry Areas"
  }
];

const sentinelOptions = [
  {
    id: "elevation",
    title: "Elevation Map",
    description: "Terrain elevation data for irrigation planning",
    icon: <Mountain className="h-5 w-5" />
  },
  {
    id: "slope",
    title: "Slope Map", 
    description: "Slope analysis for water flow management",
    icon: <TrendingUp className="h-5 w-5" />
  }
];

export default function FieldAnalyticsPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const fieldId = params.id;
  const [field, setField] = useState<Field | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("");
  const [showSentinel, setShowSentinel] = useState(false);
  const [selectedSentinel, setSelectedSentinel] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Load field data
  useEffect(() => {
    const fields = JSON.parse(localStorage.getItem('harvtech_fields') || '[]');
    const foundField = fields.find((f: Field) => f.id === fieldId);
    setField(foundField || null);
  }, [fieldId]);

  // Initialize Leaflet map for traced field display
  useEffect(() => {
    if (mapRef.current && field && field.geoJson && typeof window !== 'undefined') {
      // Dynamic import Leaflet to avoid SSR issues
      import('leaflet').then((L) => {
        if (!mapInstanceRef.current) {
          const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 10);
          mapInstanceRef.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Display the traced field boundary
          if (field.geoJson && field.geoJson.geometry) {
            const coords = field.geoJson.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
            
            const polygon = L.polygon(coords, {
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.3,
              weight: 3
            }).addTo(map);
            
            // Add field label
            const center = polygon.getBounds().getCenter();
            L.marker(center, {
              icon: L.divIcon({
                html: `<div style="background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #22c55e; font-size: 12px; font-weight: bold; color: #22c55e;">${field.name}</div>`,
                className: 'field-label',
                iconSize: [100, 20],
                iconAnchor: [50, 10]
              })
            }).addTo(map);
            
            // Fit map to show the field
            map.fitBounds(polygon.getBounds(), { padding: [10, 10] });
          }
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [field]);

  const generateHeatmapData = (analysisType: string) => {
    const colors = {
      ndvi: ['#ff0000', '#ff7f00', '#ffff00', '#7fff00', '#00ff00'], // Red to Green
      ndre: ['#ff0000', '#ff7f00', '#ffff00', '#7fff00', '#00ff00'], // Red to Green  
      msavi: ['#ffff00', '#7fff00', '#00ff7f', '#0000ff'], // Yellow to Blue
      ndmi: ['#ff0000', '#ff7f00', '#ffff00', '#00ffff', '#0000ff'] // Red to Blue
    };

    return colors[analysisType as keyof typeof colors] || colors.ndvi;
  };

  const renderHeatmapVisualization = (analysisType: string) => {
    const analysis = analysisOptions.find(opt => opt.id === analysisType);
    if (!analysis) return null;

    const colors = generateHeatmapData(analysisType);

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {analysis.icon}
            <span>{analysis.title} Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock Field Visualization */}
            <div className="relative h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              {/* Simulated heatmap overlay */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1 p-2">
                {Array.from({ length: 48 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded"
                    style={{
                      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                      opacity: 0.7
                    }}
                  />
                ))}
              </div>
              
              {/* Field boundary overlay */}
              <div className="absolute inset-0 border-4 border-black/30 rounded-lg m-4"></div>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs">
                <div className="font-semibold mb-1">{analysis.title}</div>
                <div className="text-gray-600">{analysis.colorScheme}</div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-1">Analysis Purpose</h4>
              <p className="text-sm text-blue-700">{analysis.purpose}</p>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-semibold">Recommendations</h4>
              {analysisType === 'ndvi' && (
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Apply targeted pest control in red zones</li>
                  <li>• Monitor green areas for early detection</li>
                  <li>• Schedule follow-up analysis in 2 weeks</li>
                </ul>
              )}
              {analysisType === 'ndre' && (
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Healthy green zones indicate good yield potential</li>
                  <li>• Red zones may need nutrient supplementation</li>
                  <li>• Estimate harvest timing based on health patterns</li>
                </ul>
              )}
              {analysisType === 'msavi' && (
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Blue zones have adequate fertilizer levels</li>
                  <li>• Yellow zones need additional fertilizer application</li>
                  <li>• Plan variable rate fertilizer application</li>
                </ul>
              )}
              {analysisType === 'ndmi' && (
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Red zones require immediate irrigation</li>
                  <li>• Blue zones have adequate moisture</li>
                  <li>• Plan irrigation schedule based on moisture levels</li>
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSentinelVisualization = (sentinelType: string) => {
    const sentinel = sentinelOptions.find(opt => opt.id === sentinelType);
    if (!sentinel) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {sentinel.icon}
            <span>{sentinel.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock Terrain Visualization */}
            <div className="relative h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              {/* Simulated terrain map */}
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-8 gap-1 p-2">
                {Array.from({ length: 80 }, (_, i) => {
                  const elevationColors = ['#2d5a27', '#4a7c59', '#8db4aa', '#c7d9cc', '#ffffff'];
                  const slopeColors = ['#0066cc', '#3399ff', '#66ccff', '#99ddff', '#ccf0ff'];
                  const colors = sentinelType === 'elevation' ? elevationColors : slopeColors;
                  
                  return (
                    <div
                      key={i}
                      className="rounded"
                      style={{
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        opacity: 0.8
                      }}
                    />
                  );
                })}
              </div>
              
              {/* Field boundary */}
              <div className="absolute inset-0 border-4 border-black/30 rounded-lg m-4"></div>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs">
                <div className="font-semibold mb-1">{sentinel.title}</div>
                <div className="text-gray-600">
                  {sentinelType === 'elevation' ? 'Dark = Low, Light = High' : 'Dark = Steep, Light = Flat'}
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Irrigation Planning</h4>
              <p className="text-sm text-green-700">{sentinel.description}</p>
            </div>

            {/* Water Flow Recommendations */}
            <div className="space-y-2">
              <h4 className="font-semibold">Water Management Recommendations</h4>
              {sentinelType === 'elevation' && (
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Install drainage in low-lying areas (dark zones)</li>
                  <li>• Position water sources at higher elevations</li>
                  <li>• Plan gravity-fed irrigation systems</li>
                </ul>
              )}
              {sentinelType === 'slope' && (
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Steep areas need erosion control measures</li>
                  <li>• Flat areas suitable for uniform irrigation</li>
                  <li>• Plan water flow direction for optimal coverage</li>
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!field) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ag-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading field data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-ag-green text-white p-4 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/services/fields')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Field Analytics</h1>
          <p className="text-sm opacity-90 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {field.name}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Traced Field Map Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-ag-green" />
              <span>{field.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {new Date(field.createdAt).toLocaleDateString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div 
              ref={mapRef} 
              className="w-full h-48 bg-gray-100 rounded-lg border border-gray-300"
              style={{ minHeight: '192px' }}
            >
            </div>
          </CardContent>
        </Card>

        {/* Analysis Options */}
        <div className="space-y-4">
          <h3 className="font-semibold">Analysis Options</h3>
          
          {/* Main Analysis Options */}
          <div className="grid grid-cols-2 gap-3">
            {analysisOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedAnalysis === option.id ? "default" : "outline"}
                className={`h-auto p-3 flex flex-col items-center space-y-2 ${
                  selectedAnalysis === option.id ? 'bg-ag-green hover:bg-ag-green/90' : ''
                }`}
                onClick={() => setSelectedAnalysis(selectedAnalysis === option.id ? "" : option.id)}
              >
                {option.icon}
                <div className="text-center">
                  <div className="font-semibold text-xs">{option.title}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Sentinel Dropdown */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowSentinel(!showSentinel)}
            >
              <span className="flex items-center">
                <Mountain className="h-4 w-4 mr-2" />
                Sentinel Analysis
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSentinel ? 'rotate-180' : ''}`} />
            </Button>
            
            {showSentinel && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {sentinelOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedSentinel === option.id ? "default" : "outline"}
                    className={`h-auto p-3 flex flex-col items-center space-y-2 ${
                      selectedSentinel === option.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                    }`}
                    onClick={() => setSelectedSentinel(selectedSentinel === option.id ? "" : option.id)}
                  >
                    {option.icon}
                    <div className="text-center">
                      <div className="font-semibold text-xs">{option.title}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {selectedAnalysis && renderHeatmapVisualization(selectedAnalysis)}
        {selectedSentinel && renderSentinelVisualization(selectedSentinel)}
      </div>
    </div>
  );
}