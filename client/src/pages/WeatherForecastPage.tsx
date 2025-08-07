import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

export default function WeatherForecastPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const fieldId = params.id;
  const [field, setField] = useState<Field | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Load field data
  useEffect(() => {
    const fields = JSON.parse(localStorage.getItem('harvtech_fields') || '[]');
    const foundField = fields.find((f: Field) => f.id === fieldId);
    setField(foundField || null);
  }, [fieldId]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const generateMonthData = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    
    // Generate mock data based on month
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isOptimal = [3, 7, 14, 21, 28].includes(day) && month >= 2 && month <= 10; // Sowing season
      const isHarvest = [15, 30].includes(day) && month >= 8 && month <= 11; // Harvest season
      const isRainy = [10, 11, 12, 20, 25].includes(day) && month >= 5 && month <= 9; // Monsoon
      
      data.push({
        day,
        isOptimal,
        isHarvest,
        isRainy
      });
    }
    
    return { daysInMonth, firstDay, data };
  };

  const { daysInMonth, firstDay, data } = generateMonthData(currentMonth, currentYear);

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
      <div className="bg-blue-600 text-white p-4 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation(`/services/weather/${fieldId}`)}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Agricultural Forecast</h1>
          <p className="text-sm opacity-90 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {field.name}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Month Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{monthNames[currentMonth]} {currentYear}</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-4">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="font-semibold p-2 text-gray-600">{day}</div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={i} className="p-2"></div>
              ))}
              
              {/* Days of the month */}
              {data.map(({ day, isOptimal, isHarvest, isRainy }) => (
                <div 
                  key={day} 
                  className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 ${
                    isOptimal ? 'bg-green-100 text-green-800 font-semibold' :
                    isHarvest ? 'bg-orange-100 text-orange-800 font-semibold' :
                    isRainy ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </div>
              ))}
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
          </CardContent>
        </Card>

        {/* Month-specific Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {monthNames[currentMonth]} Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 text-sm mb-2">Activities for {monthNames[currentMonth]}</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {currentMonth >= 2 && currentMonth <= 5 && (
                  <>
                    <li>• Prepare fields for summer crops</li>
                    <li>• Check irrigation systems</li>
                    <li>• Plan seed procurement</li>
                  </>
                )}
                {currentMonth >= 6 && currentMonth <= 9 && (
                  <>
                    <li>• Monitor monsoon progress</li>
                    <li>• Plant monsoon crops (rice, cotton)</li>
                    <li>• Ensure proper drainage</li>
                  </>
                )}
                {currentMonth >= 10 && currentMonth <= 1 && (
                  <>
                    <li>• Harvest mature crops</li>
                    <li>• Prepare for winter sowing</li>
                    <li>• Store harvested grains properly</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Weather Pattern for Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expected Weather Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-semibold text-blue-800">Temperature</div>
                <div className="text-blue-600">
                  {currentMonth >= 3 && currentMonth <= 6 ? '28-35°C' :
                   currentMonth >= 7 && currentMonth <= 9 ? '24-30°C' :
                   '20-28°C'}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-semibold text-green-800">Rainfall</div>
                <div className="text-green-600">
                  {currentMonth >= 6 && currentMonth <= 9 ? 'High (200-400mm)' :
                   currentMonth >= 3 && currentMonth <= 5 ? 'Moderate (50-150mm)' :
                   'Low (10-50mm)'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}