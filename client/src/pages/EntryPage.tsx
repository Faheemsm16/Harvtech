import { Button } from "@/components/ui/button";
import { Globe, HelpCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import logoPath from "@assets/Logo_1754240298298.jpeg";

export default function EntryPage() {
  const { currentLanguage, toggleLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();

  const openHelp = () => {
    window.location.href = 'mailto:support@harvtech.com?subject=Help Request&body=Hello HARVTECH Support Team,%0D%0A%0D%0AI need assistance with...';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with Language Toggle */}
      <div className="flex justify-between items-center p-4">
        <div></div>
        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className="flex items-center space-x-2 bg-ag-green/10 text-ag-green hover:bg-ag-green/20"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentLanguage === 'english' ? 'English' : 'தமிழ்'}
          </span>
        </Button>
      </div>
      
      {/* Logo and Branding */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="w-24 h-24 bg-ag-green rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
          <img 
            src={logoPath} 
            alt="HARVTECH Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-ag-dark mb-2">
          {t('company_name')}
        </h1>
        <p className="text-lg text-gray-600 text-center leading-relaxed">
          {t('tagline')}
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-4">
        <Button 
          onClick={() => setLocation('/login')}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 text-lg font-semibold shadow-lg"
        >
          {t('login')}
        </Button>
        
        <Button 
          onClick={() => setLocation('/role-selection')}
          variant="outline"
          className="w-full border-2 border-ag-green text-ag-green hover:bg-ag-green/5 py-6 text-lg font-semibold"
        >
          {t('register')}
        </Button>
        
        <Button 
          onClick={openHelp}
          variant="ghost"
          className="w-full flex items-center justify-center space-x-2 text-gray-600 py-3"
        >
          <HelpCircle className="h-4 w-4" />
          <span>{t('help')}</span>
        </Button>
      </div>
    </div>
  );
}
