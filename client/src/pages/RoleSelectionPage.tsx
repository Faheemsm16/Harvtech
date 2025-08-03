import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";

export default function RoleSelectionPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mr-4 text-ag-green p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">{t('select_role')}</h2>
      </div>
      
      {/* Role Options */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-2">{t('role_question')}</h3>
          <p className="text-gray-600">{t('role_description')}</p>
        </div>
        
        {/* Owner Option */}
        <Button 
          onClick={() => setLocation('/owner-registration')}
          className="w-full bg-ag-brown hover:bg-ag-brown/90 text-white py-8 font-semibold text-lg shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <UserCheck className="h-8 w-8" />
            <div className="text-left">
              <div className="text-lg">{t('owner')}</div>
              <div className="text-sm opacity-90">{t('owner_desc')}</div>
            </div>
          </div>
        </Button>
        
        {/* User Option */}
        <Button 
          onClick={() => setLocation('/user-registration')}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-8 font-semibold text-lg shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8" />
            <div className="text-left">
              <div className="text-lg">{t('user')}</div>
              <div className="text-sm opacity-90">{t('user_desc')}</div>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
