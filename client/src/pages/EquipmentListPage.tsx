import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Equipment {
  id: string;
  name: string;
  type: string;
  power?: string;
  location?: string;
  availability: string;
  pricePerDay: number;
  imageUrl?: string;
}

export default function EquipmentListPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { type } = useParams();

  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ['/api/equipment', type],
    enabled: !!type,
  });

  const handleSelect = (equipmentId: string) => {
    setLocation(`/payment/${equipmentId}`);
  };

  const getEquipmentImage = (equipmentType: string) => {
    switch (equipmentType) {
      case 'tractor':
        return 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
      case 'weeder':
        return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
      case 'tiller':
        return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
      default:
        return 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setLocation('/user-dashboard')}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            Available {type ? t(type) : 'Equipment'}s
          </h2>
        </div>
      </div>
      
      {/* Equipment Cards */}
      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading equipment...</div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {type} equipment available at the moment
          </div>
        ) : (
          equipment.map((item: Equipment) => (
            <Card key={item.id} className="bg-white border border-gray-200 overflow-hidden">
              {/* Equipment Image */}
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={item.imageUrl || getEquipmentImage(item.type)} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  1/3
                </div>
              </div>
              
              {/* Equipment Details */}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {item.power && (
                    <div className="flex justify-between">
                      <span>{t('power')}:</span>
                      <span>{item.power}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex justify-between">
                      <span>{t('location')}:</span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('availability')}:</span>
                    <span className="text-green-600 font-medium capitalize">
                      {item.availability === 'available' ? 'Available' : item.availability}
                    </span>
                  </div>
                </div>
                
                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-ag-green">₹{item.pricePerDay}</p>
                    <p className="text-sm text-gray-600">{t('per_day')}</p>
                  </div>
                  <Button 
                    onClick={() => handleSelect(item.id)}
                    className="bg-ag-green hover:bg-ag-green/90 text-white px-6 py-2 font-medium"
                  >
                    {t('select')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
