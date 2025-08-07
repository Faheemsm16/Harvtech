import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer,
  Droplets,
  Eye,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
    condition: string;
    rainfall: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    rainChance: number;
    windSpeed: number;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export default function WeatherAnalysisPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const fieldId = params.id;
  const [field, setField] = useState<Field | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Load field data
  useEffect(() => {
    const fields = JSON.parse(localStorage.getItem('harvtech_fields') || '[]');
    const foundField = fields.find((f: Field) => f.id === fieldId);
    setField(foundField || null);
  }, [fieldId]);

  // Mock weather data generation
  useEffect(() => {
    const mockWeatherData: WeatherData = {
      current: {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        visibility: 8.5,
        condition: "Partly Cloudy",
        rainfall: 0.2
      },
      forecast: [
        { date: "Today", high: 32, low: 24, condition: "Sunny", rainChance: 10, windSpeed: 8 },
        { date: "Tomorrow", high: 29, low: 22, condition: "Cloudy", rainChance: 30, windSpeed: 12 },
        { date: "Day 3", high: 26, low: 20, condition: "Rainy", rainChance: 80, windSpeed: 15 },
        { date: "Day 4", high: 28, low: 21, condition: "Partly Cloudy", rainChance: 20, windSpeed: 10 },
        { date: "Day 5", high: 31, low: 25, condition: "Sunny", rainChance: 5, windSpeed: 6 }
      ],
      alerts: [
        {
          type: "Heavy Rain Warning",
          message: "Heavy rainfall expected in 2 days. Consider postponing fertilizer application.",
          severity: "medium"
        },
        {
          type: "High Wind Alert", 
          message: "Wind speeds may reach 25 km/h tomorrow. Avoid aerial spraying.",
          severity: "low"
        }
      ]
    };

    // Simulate loading delay
    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (loading) {
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
            <h1 className="text-lg font-semibold">Weather Analysis</h1>
            <p className="text-sm opacity-90 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {field.name}
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-ag-green border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading weather data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

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
          <h1 className="text-lg font-semibold">Weather Analysis</h1>
          <p className="text-sm opacity-90 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {field.name}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Forecast and Analysis Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => setShowForecast(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Forecast
          </Button>
          <Button 
            onClick={() => setShowAnalysis(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis
          </Button>
        </div>

        {/* Weather Alerts */}
        {weatherData.alerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              Weather Alerts
            </h3>
            {weatherData.alerts.map((alert, index) => (
              <Card key={index} className={`border ${getSeverityColor(alert.severity)}`}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">{alert.type}</h4>
                      <p className="text-xs mt-1">{alert.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Current Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>Current Weather</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                {getWeatherIcon(weatherData.current.condition)}
                <p className="text-2xl font-bold mt-2">{weatherData.current.temperature}°C</p>
                <p className="text-sm text-gray-600">{weatherData.current.condition}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center">
                    <Droplets className="h-4 w-4 mr-1" />
                    Humidity
                  </span>
                  <span className="text-sm font-semibold">{weatherData.current.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center">
                    <Wind className="h-4 w-4 mr-1" />
                    Wind Speed
                  </span>
                  <span className="text-sm font-semibold">{weatherData.current.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Visibility
                  </span>
                  <span className="text-sm font-semibold">{weatherData.current.visibility} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center">
                    <CloudRain className="h-4 w-4 mr-1" />
                    Rainfall
                  </span>
                  <span className="text-sm font-semibold">{weatherData.current.rainfall} mm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5-Day Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>5-Day Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getWeatherIcon(day.condition)}
                    <div>
                      <p className="font-semibold text-sm">{day.date}</p>
                      <p className="text-xs text-gray-600">{day.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{day.high}°</span>
                      <span className="text-sm text-gray-500">{day.low}°</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-blue-600">{day.rainChance}%</span>
                      <span className="text-xs text-gray-500">{day.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Agricultural Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 text-sm">Optimal Activities Today</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Current conditions ideal for field monitoring</li>
                  <li>• Good visibility for equipment operation</li>
                  <li>• Low wind speeds suitable for spraying</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 text-sm">Weather Planning</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Heavy rain expected in 2 days - plan indoor activities</li>
                  <li>• Complete pesticide application before rain</li>
                  <li>• Check drainage systems before rainfall</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 text-sm">Irrigation Schedule</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Current humidity at {weatherData.current.humidity}% - moderate irrigation needed</li>
                  <li>• Reduce watering before expected rainfall</li>
                  <li>• Monitor soil moisture after rain event</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Calendar Dialog */}
      <Dialog open={showForecast} onOpenChange={setShowForecast}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>30-Day Agricultural Forecast</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="font-semibold p-2 text-gray-600">{day}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const isOptimal = [3, 7, 14, 21, 28].includes(day); // Sowing days
                const isHarvest = [15, 30].includes(day); // Harvest predictions
                const isRainy = [10, 11, 12, 20, 25].includes(day); // Rainy days
                
                return (
                  <div 
                    key={day} 
                    className={`p-2 rounded text-xs ${
                      isOptimal ? 'bg-green-100 text-green-800 font-semibold' :
                      isHarvest ? 'bg-orange-100 text-orange-800 font-semibold' :
                      isRainy ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Optimal Sowing Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>Predicted Harvest Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Expected Rainfall</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 text-sm mb-2">This Month's Recommendations</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Days 3, 7, 14: Optimal for rice sowing</li>
                <li>• Days 10-12: Heavy rain expected - avoid field work</li>
                <li>• Day 15: Early harvest window for short-duration crops</li>
                <li>• Days 21, 28: Second sowing opportunity</li>
                <li>• Day 30: Main harvest season begins</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Historical Weather Analysis</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Historical Data Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last 6 Months Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-semibold text-blue-800">Avg Temperature</div>
                    <div className="text-blue-600">26.8°C (+1.2°C)</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-semibold text-green-800">Total Rainfall</div>
                    <div className="text-green-600">340mm (-45mm)</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="font-semibold text-yellow-800">Humidity</div>
                    <div className="text-yellow-600">68% (Normal)</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="font-semibold text-purple-800">Wind Speed</div>
                    <div className="text-purple-600">11 km/h (-2 km/h)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Weather Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {[
                    { month: 'Jan', temp: '24°C', rain: '15mm', condition: 'Dry' },
                    { month: 'Feb', temp: '26°C', rain: '8mm', condition: 'Dry' },
                    { month: 'Mar', temp: '29°C', rain: '22mm', condition: 'Mild' },
                    { month: 'Apr', temp: '32°C', rain: '45mm', condition: 'Hot' },
                    { month: 'May', temp: '28°C', rain: '125mm', condition: 'Wet' },
                    { month: 'Jun', temp: '26°C', rain: '185mm', condition: 'Monsoon' }
                  ].map((data, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{data.month}</span>
                      <span>{data.temp}</span>
                      <span className="text-blue-600">{data.rain}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        data.condition === 'Dry' ? 'bg-yellow-100 text-yellow-700' :
                        data.condition === 'Wet' || data.condition === 'Monsoon' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{data.condition}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-semibold text-purple-800 text-sm mb-2">Key Insights</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Temperature has increased by 1.2°C compared to last year</li>
                <li>• Rainfall deficit of 45mm may affect crop yield</li>
                <li>• Early monsoon arrival expected this year</li>
                <li>• Extreme weather events increased by 15%</li>
                <li>• Optimal planting window shifted by 5-7 days</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}