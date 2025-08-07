import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  TrendingUp, 
  Cloud, 
  Plus,
  Calendar
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

export default function SavedFieldsPage() {
  const [, setLocation] = useLocation();
  const [savedFields, setSavedFields] = useState<Field[]>([]);

  // Load saved fields from localStorage
  useEffect(() => {
    const fields = JSON.parse(localStorage.getItem('harvtech_fields') || '[]');
    setSavedFields(fields);
  }, []);

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
          onClick={() => setLocation('/services')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Saved Fields</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Add New Field Button */}
        <Button 
          onClick={() => setLocation('/services')}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Field
        </Button>

        {/* Fields List */}
        {savedFields.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Fields Added</h3>
            <p className="text-sm text-gray-500 mb-6">
              Start by adding your first field using satellite mapping or manual drawing
            </p>
            <Button 
              onClick={() => setLocation('/services')}
              className="bg-ag-green hover:bg-ag-green/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Field
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedFields.map((field) => (
              <Card key={field.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <MapPin className="h-4 w-4 text-ag-green" />
                      <span>{field.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(field.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleFieldAnalytics(field)}
                      size="sm"
                      className="bg-ag-green hover:bg-ag-green/90 text-white"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    <Button 
                      onClick={() => handleWeatherAnalysis(field)}
                      size="sm"
                      variant="outline"
                      className="border-ag-green text-ag-green hover:bg-ag-green/10"
                    >
                      <Cloud className="h-3 w-3 mr-1" />
                      Weather
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Services Options */}
        {savedFields.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Field Management Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 text-sm">Crop Monitoring</h4>
                  <p className="text-sm text-green-700 mt-1">
                    NDVI, NDRE, MSAVI/RECI analysis for pest detection, plant health, and nutrient management
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 text-sm">Weather Analysis</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Real-time weather data, 5-day forecasts, and agricultural recommendations
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 text-sm">Irrigation Planning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Sentinel elevation and slope analysis for optimal water management
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}