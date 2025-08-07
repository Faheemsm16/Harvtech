import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

export default function WeatherAnalysisHistoryPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const fieldId = params.id;
  const [field, setField] = useState<Field | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Load field data
  useEffect(() => {
    const fields = JSON.parse(localStorage.getItem('harvtech_fields') || '[]');
    const foundField = fields.find((f: Field) => f.id === fieldId);
    setField(foundField || null);
  }, [fieldId]);

  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentYear(currentYear + 1);
    }
  };

  const generateYearData = (year: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      // Generate realistic but varied data based on Indian climate patterns
      const baseTemp = year === new Date().getFullYear() ? 
        [24, 26, 29, 32, 28, 26, 25, 25, 27, 29, 26, 24][index] :
        [23, 25, 28, 31, 27, 25, 24, 24, 26, 28, 25, 23][index];
      
      const baseRain = year === new Date().getFullYear() ? 
        [15, 8, 22, 45, 125, 185, 220, 180, 95, 35, 12, 5][index] :
        [18, 12, 25, 50, 130, 200, 240, 195, 105, 40, 15, 8][index];

      const condition = baseRain > 150 ? 'Monsoon' : 
                       baseRain > 50 ? 'Wet' :
                       baseRain > 20 ? 'Mild' : 'Dry';

      return {
        month,
        temp: `${baseTemp}°C`,
        rain: `${baseRain}mm`,
        condition,
        tempChange: year === new Date().getFullYear() ? 
          (index % 3 === 0 ? '+1.2°C' : index % 3 === 1 ? '+0.8°C' : '+0.5°C') :
          '+0.0°C',
        rainChange: year === new Date().getFullYear() ? 
          (index % 4 === 0 ? '-15mm' : index % 4 === 1 ? '-10mm' : index % 4 === 2 ? '-5mm' : '+2mm') :
          '+0mm'
      };
    });
  };

  const yearData = generateYearData(currentYear);
  const isCurrentYear = currentYear === new Date().getFullYear();

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
      <div className="bg-purple-600 text-white p-4 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation(`/services/weather/${fieldId}`)}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Weather Analysis</h1>
          <p className="text-sm opacity-90 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {field.name}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Year Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('prev')}
                disabled={currentYear <= 2020}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{currentYear} Analysis</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('next')}
                disabled={currentYear >= new Date().getFullYear()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Year Summary */}
        {isCurrentYear && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Year-to-Date Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-semibold text-blue-800">Avg Temperature</div>
                  <div className="text-blue-600 flex items-center">
                    26.8°C 
                    <TrendingUp className="h-3 w-3 ml-1" />
                    <span className="text-red-600">+1.2°C</span>
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-semibold text-green-800">Total Rainfall</div>
                  <div className="text-green-600 flex items-center">
                    340mm 
                    <TrendingDown className="h-3 w-3 ml-1" />
                    <span className="text-orange-600">-45mm</span>
                  </div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="font-semibold text-yellow-800">Avg Humidity</div>
                  <div className="text-yellow-600">68% (Normal)</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-semibold text-purple-800">Avg Wind Speed</div>
                  <div className="text-purple-600 flex items-center">
                    11 km/h
                    <TrendingDown className="h-3 w-3 ml-1" />
                    <span className="text-green-600">-2 km/h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Weather Patterns - {currentYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              {yearData.map((data, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium w-8">{data.month}</span>
                  <div className="flex items-center space-x-1">
                    <span className="w-12">{data.temp}</span>
                    {isCurrentYear && (
                      <span className="text-red-600 text-xs">{data.tempChange}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-600 w-12">{data.rain}</span>
                    {isCurrentYear && (
                      <span className="text-orange-600 text-xs">{data.rainChange}</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs w-16 text-center ${
                    data.condition === 'Dry' ? 'bg-yellow-100 text-yellow-700' :
                    data.condition === 'Wet' || data.condition === 'Monsoon' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{data.condition}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Climate Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Climate Insights for {currentYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-semibold text-purple-800 text-sm mb-2">Key Observations</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                {isCurrentYear ? (
                  <>
                    <li>• Temperature has increased by 1.2°C compared to last year</li>
                    <li>• Rainfall deficit of 45mm may affect crop yield</li>
                    <li>• Early monsoon arrival expected this year</li>
                    <li>• Extreme weather events increased by 15%</li>
                    <li>• Optimal planting window shifted by 5-7 days</li>
                  </>
                ) : (
                  <>
                    <li>• Average temperature was within normal range</li>
                    <li>• Monsoon season had regular precipitation patterns</li>
                    <li>• No significant extreme weather events recorded</li>
                    <li>• Agricultural seasons followed traditional timing</li>
                    <li>• Overall favorable conditions for crop production</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agricultural Impact Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${
                isCurrentYear ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
              }`}>
                <h4 className={`font-semibold text-sm ${
                  isCurrentYear ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  Crop Yield Prediction
                </h4>
                <p className={`text-sm mt-1 ${
                  isCurrentYear ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {isCurrentYear ? 
                    'Expected 8-12% decrease due to temperature rise and rainfall deficit' :
                    'Yields were within expected range for the season'
                  }
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 text-sm">Irrigation Requirements</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {isCurrentYear ? 
                    'Increased irrigation needed during dry periods, especially Apr-May' :
                    'Standard irrigation schedule was sufficient'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}