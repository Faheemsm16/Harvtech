import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, TrendingUp, ArrowRight, BarChart3, Leaf, CloudSun } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const services: Service[] = [
  {
    id: "1",
    title: "Slope Data/Elevation Data",
    description: "Irrigation management based on land elevation and slope analysis",
    icon: <MapPin className="h-8 w-8 text-red-500" />,
    comingSoon: true
  },
  {
    id: "2", 
    title: "MSAVI, RECI",
    description: "Amount of fertilizers calculation using vegetation indices",
    icon: <BarChart3 className="h-8 w-8 text-ag-green" />,
    comingSoon: true
  },
  {
    id: "3",
    title: "NDRE - Plate State",
    description: "Yield prediction and harvest planning using normalized difference red edge",
    icon: <Leaf className="h-8 w-8 text-ag-green" />,
    comingSoon: true
  },
  {
    id: "4",
    title: "NDVI - Pest Reduction",
    description: "Pest management and reduction using normalized difference vegetation index",
    icon: <Leaf className="h-8 w-8 text-ag-green" />,
    comingSoon: true
  },
  {
    id: "5",
    title: "Forecast Analysis",
    description: "Weather forecast analysis for agricultural planning",
    icon: <CloudSun className="h-8 w-8 text-blue-500" />,
    comingSoon: true
  },
  {
    id: "6",
    title: "Analysis History", 
    description: "Historical weather and crop analysis data",
    icon: <CloudSun className="h-8 w-8 text-blue-500" />,
    comingSoon: true
  }
];

export function ServicesModal({ isOpen, onClose }: ServicesModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleServiceClick = (service: Service) => {
    if (service.comingSoon) {
      toast({
        title: "Coming Soon!",
        description: `${service.title} feature will be available soon. Stay tuned!`,
        duration: 3000,
      });
    } else {
      // Handle service navigation here
      console.log(`Navigate to ${service.title}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>{t('services') || 'Services'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                All services require land mapping where your agricultural land will be marked and used for analysis.
              </p>
            </div>
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="cursor-pointer hover:bg-gray-50 transition-colors relative"
                onClick={() => handleServiceClick(service)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {service.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{service.title}</h3>
                        {service.comingSoon && (
                          <span className="text-xs bg-ag-orange/10 text-ag-orange px-2 py-1 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center text-ag-green text-xs font-medium">
                        <span>Learn More</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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