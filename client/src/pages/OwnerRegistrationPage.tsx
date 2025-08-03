import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Tractor, Wrench, Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SuccessModal } from "@/components/SuccessModal";

interface FormData {
  equipmentType: string;
  modelNumber: string;
  chassisNumber: string;
  name: string;
  city: string;
  country: string;
  aadhaarNumber: string;
  mobileNumber: string;
}

export default function OwnerRegistrationPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [farmerId, setFarmerId] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    equipmentType: "",
    modelNumber: "",
    chassisNumber: "",
    name: "",
    city: "",
    country: "India",
    aadhaarNumber: "",
    mobileNumber: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const { equipmentType, modelNumber, chassisNumber } = formData;
    
    if (!equipmentType) {
      toast({ title: "Error", description: "Please select equipment type", variant: "destructive" });
      return false;
    }
    
    if (!modelNumber.trim()) {
      toast({ title: "Error", description: "Please enter model number", variant: "destructive" });
      return false;
    }
    
    if (!chassisNumber.trim()) {
      toast({ title: "Error", description: "Please enter chassis number or VIN", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { name, city, aadhaarNumber, mobileNumber } = formData;
    
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return false;
    }
    
    if (!city.trim()) {
      toast({ title: "Error", description: "Please enter your city", variant: "destructive" });
      return false;
    }
    
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast({ title: "Error", description: "Please enter a valid 12-digit Aadhaar number", variant: "destructive" });
      return false;
    }
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({ title: "Error", description: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      // Register user
      const registrationData = {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        aadhaarNumber: formData.aadhaarNumber,
        mobileNumber: formData.mobileNumber,
        role: "owner",
      };

      const userResponse = await apiRequest('POST', '/api/register', registrationData);
      const userData = await userResponse.json();

      // Create equipment
      const equipmentData = {
        type: formData.equipmentType,
        name: `${formData.equipmentType.charAt(0).toUpperCase() + formData.equipmentType.slice(1)} ${formData.modelNumber}`,
        modelNumber: formData.modelNumber,
        chassisNumber: formData.chassisNumber,
        power: "50 HP", // Default value
        year: new Date().getFullYear(),
        pricePerDay: formData.equipmentType === 'tractor' ? 800 : formData.equipmentType === 'weeder' ? 200 : 300,
        location: `${formData.city}, Tamil Nadu`,
      };

      await apiRequest('POST', '/api/equipment', equipmentData);

      setFarmerId(userData.farmerId);
      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setLocation('/login');
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tractor': return <Tractor className="h-5 w-5" />;
      case 'weeder': return <Wrench className="h-5 w-5" />;
      case 'tiller': return <Settings className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => currentStep === 1 ? setLocation('/role-selection') : setCurrentStep(1)}
          className="mr-4 text-ag-green p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">{t('owner_registration')}</h2>
      </div>
      
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-ag-green text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center text-sm font-semibold`}>
            1
          </div>
          <div className="w-16 h-1 bg-gray-300"></div>
          <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-ag-green text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center text-sm font-semibold`}>
            2
          </div>
        </div>
      </div>
      
      {/* Step 1: Equipment Selection */}
      {currentStep === 1 && (
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('select_equipment')}</h3>
            
            <RadioGroup
              value={formData.equipmentType}
              onValueChange={(value) => handleInputChange('equipmentType', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="tractor" id="tractor" />
                <Label htmlFor="tractor" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <Tractor className="h-5 w-5 text-ag-green" />
                  <span className="font-medium">{t('tractor')}</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="weeder" id="weeder" />
                <Label htmlFor="weeder" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <Wrench className="h-5 w-5 text-ag-green" />
                  <span className="font-medium">{t('weeder')}</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="tiller" id="tiller" />
                <Label htmlFor="tiller" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <Settings className="h-5 w-5 text-ag-green" />
                  <span className="font-medium">{t('tiller')}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('model_number')} *</Label>
              <Input
                type="text"
                placeholder="Enter model number"
                value={formData.modelNumber}
                onChange={(e) => handleInputChange('modelNumber', e.target.value)}
                className="py-4 focus:ring-2 focus:ring-ag-green"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('chassis_vin')} *</Label>
              <Input
                type="text"
                placeholder="Enter chassis number or VIN"
                value={formData.chassisNumber}
                onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                className="py-4 focus:ring-2 focus:ring-ag-green"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-ag-brown hover:bg-ag-brown/90 text-white py-6 font-semibold"
          >
            {t('continue')}
          </Button>
        </div>
      )}

      {/* Step 2: Personal Details */}
      {currentStep === 2 && (
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('full_name')} *</Label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="py-4 focus:ring-2 focus:ring-ag-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('city')} *</Label>
            <Input
              type="text"
              placeholder="Enter your city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="py-4 focus:ring-2 focus:ring-ag-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('country')}</Label>
            <Input
              type="text"
              value={formData.country}
              readOnly
              className="py-4 bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('aadhaar_number')} *</Label>
            <Input
              type="text"
              placeholder="12-digit Aadhaar number"
              value={formData.aadhaarNumber}
              onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
              maxLength={12}
              className="py-4 focus:ring-2 focus:ring-ag-green"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('mobile_number')} *</Label>
            <div className="flex">
              <div className="bg-gray-100 px-3 py-4 rounded-l-xl border border-r-0 border-gray-300 flex items-center">
                <span className="text-gray-600">+91</span>
              </div>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                maxLength={10}
                className="flex-1 rounded-l-none border-l-0 py-4 focus:ring-2 focus:ring-ag-green"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-ag-brown hover:bg-ag-brown/90 text-white py-6 font-semibold"
          >
            {t('register')}
          </Button>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message="Registration completed successfully"
        farmerId={farmerId}
      />
    </div>
  );
}
