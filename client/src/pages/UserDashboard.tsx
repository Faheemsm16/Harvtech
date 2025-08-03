import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tractor, Wrench, Settings, Network, Bell, User, LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function UserDashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const navigateToEquipment = (type: string) => {
    setLocation(`/equipment/${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('welcome')}</h2>
              <p className="text-sm opacity-90">{user?.name || 'User'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/10 p-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Farmer ID */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-3">
            <p className="text-xs opacity-75 mb-1">{t('farmer_id')}</p>
            <p className="font-mono text-sm">{user?.farmerId || 'FRM-000000'}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Machine Lease Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('machine_lease')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Tractor */}
            <Button
              variant="outline"
              onClick={() => navigateToEquipment('tractor')}
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-white border border-gray-200 hover:border-ag-green"
            >
              <Tractor className="h-8 w-8 text-ag-green" />
              <span className="text-sm font-medium">{t('tractor')}</span>
            </Button>
            
            {/* Weeder */}
            <Button
              variant="outline"
              onClick={() => navigateToEquipment('weeder')}
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-white border border-gray-200 hover:border-ag-green"
            >
              <Wrench className="h-8 w-8 text-ag-green" />
              <span className="text-sm font-medium">{t('weeder')}</span>
            </Button>
            
            {/* Tiller */}
            <Button
              variant="outline"
              onClick={() => navigateToEquipment('tiller')}
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-white border border-gray-200 hover:border-ag-green"
            >
              <Settings className="h-8 w-8 text-ag-green" />
              <span className="text-sm font-medium">{t('tiller')}</span>
            </Button>
          </div>
        </div>
        
        {/* Other Services */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full bg-white border border-gray-200 p-4 h-auto justify-start hover:border-ag-orange"
          >
            <Network className="h-5 w-5 text-ag-orange mr-3" />
            <span className="font-medium">{t('platforms')}</span>
            <span className="ml-auto text-gray-400">→</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-white border border-gray-200 p-4 h-auto justify-start hover:border-ag-orange"
          >
            <Bell className="h-5 w-5 text-ag-orange mr-3" />
            <span className="font-medium">{t('services')}</span>
            <span className="ml-auto text-gray-400">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
