import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
            onClick={() => setLocation(`/services/weather/${fieldId}/forecast`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Forecast
          </Button>
          <Button 
            onClick={() => setLocation(`/services/weather/${fieldId}/analysis`)}
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

    </div>
  );
}