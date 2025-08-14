import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Building, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function PlatformsPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleBack = () => {
    // Navigate back to appropriate dashboard based on user role
    if (user?.role === 'owner') {
      setLocation('/owner-dashboard');
    } else {
      setLocation('/user-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{t('platforms') || 'Platforms'}</h2>
            <p className="text-sm opacity-90">{t('choose_platform')}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Insurance & Finance */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
              onClick={() => setLocation('/insurance-finance')}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{t('insurance_finance')}</h3>
                <p className="text-sm text-gray-600">{t('access_insurance_finance')}</p>
              </div>
              <div className="flex-shrink-0 text-gray-400 self-center">→</div>
            </Button>
          </CardContent>
        </Card>

        {/* Government Schemes */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
              onClick={() => setLocation('/government-schemes')}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{t('government_schemes')}</h3>
                <p className="text-sm text-gray-600">{t('access_government_schemes')}</p>
              </div>
              <div className="flex-shrink-0 text-gray-400 self-center">→</div>
            </Button>
          </CardContent>
        </Card>

        {/* Marketplace */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-6 flex items-center justify-start space-x-4 hover:bg-gray-50 rounded-none"
              onClick={() => setLocation('/marketplace')}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{t('marketplace')}</h3>
                <p className="text-sm text-gray-600">{t('browse_shop_agricultural')}</p>
              </div>
              <div className="flex-shrink-0 text-gray-400 self-center">→</div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}