import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tractor, Wrench, Settings, Calendar, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  name: string;
  type: string;
  modelNumber: string;
  chassisNumber: string;
  power?: string;
  year?: number;
  availability: string;
  imageUrl?: string;
  pricePerDay?: number;
  location?: string;
}

interface OwnerEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment[];
}

export function OwnerEquipmentModal({ isOpen, onClose, equipment }: OwnerEquipmentModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tractor':
        return <Tractor className="h-6 w-6 text-ag-green" />;
      case 'weeder':
        return <Wrench className="h-6 w-6 text-ag-green" />;
      case 'tiller':
        return <Settings className="h-6 w-6 text-ag-green" />;
      default:
        return <Tractor className="h-6 w-6 text-ag-green" />;
    }
  };

  const getEquipmentImage = (type: string) => {
    switch (type) {
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

  const handleMakeAvailable = (equipmentId: string) => {
    toast({
      title: "Equipment Listed",
      description: "Your equipment is now available for lease!",
      duration: 3000,
    });
  };

  const handleManageBookings = (equipmentId: string) => {
    toast({
      title: "Coming Soon",
      description: "Booking management feature will be available soon!",
      duration: 3000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{t('my_equipment') || 'My Equipment'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-96">
          {equipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tractor className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No equipment registered</p>
              <p className="text-sm mt-1">Register your equipment to start leasing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {equipment.map((item) => (
                <Card key={item.id} className="bg-white border border-gray-200">
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={item.imageUrl || getEquipmentImage(item.type)} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {getEquipmentIcon(item.type)}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={item.availability === 'available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.availability}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-600 capitalize">{item.type}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Model:</span>
                        <p className="font-medium">{item.modelNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <p className="font-medium">{item.year || '2022'}</p>
                      </div>
                      {item.power && (
                        <div>
                          <span className="text-gray-500">Power:</span>
                          <p className="font-medium">{item.power}</p>
                        </div>
                      )}
                      {item.pricePerDay && (
                        <div>
                          <span className="text-gray-500">Rate/Day:</span>
                          <p className="font-medium text-ag-green">₹{item.pricePerDay}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {item.availability === 'available' ? (
                        <Button 
                          onClick={() => handleManageBookings(item.id)}
                          className="w-full bg-ag-green hover:bg-ag-green/90 text-white text-xs py-2"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Manage Bookings
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleMakeAvailable(item.id)}
                          variant="outline"
                          className="w-full border-ag-green text-ag-green hover:bg-ag-green/10 text-xs py-2"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Make Available
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}