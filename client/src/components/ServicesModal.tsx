import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { FieldMapInterface } from "./FieldMapInterface";
import { FieldAnalyticsPage } from "./FieldAnalyticsPage";
import { WeatherAnalysisPage } from "./WeatherAnalysisPage";

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Field {
  id: string;
  name: string;
  geoJson: any;
  createdAt: string;
}

type ViewMode = 'map' | 'analytics' | 'weather';

export function ServicesModal({ isOpen, onClose }: ServicesModalProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  const handleFieldAnalytics = (field: Field) => {
    setSelectedField(field);
    setViewMode('analytics');
  };

  const handleWeatherAnalysis = (field: Field) => {
    setSelectedField(field);
    setViewMode('weather');
  };

  const handleBack = () => {
    setViewMode('map');
    setSelectedField(null);
  };

  const handleClose = () => {
    setViewMode('map');
    setSelectedField(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('services') || 'Services'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'map' && (
            <FieldMapInterface 
              onFieldAnalytics={handleFieldAnalytics}
              onWeatherAnalysis={handleWeatherAnalysis}
            />
          )}
          
          {viewMode === 'analytics' && selectedField && (
            <FieldAnalyticsPage 
              field={selectedField}
              onBack={handleBack}
            />
          )}
          
          {viewMode === 'weather' && selectedField && (
            <WeatherAnalysisPage 
              field={selectedField}
              onBack={handleBack}
            />
          )}
        </div>
        
        {viewMode === 'map' && (
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}