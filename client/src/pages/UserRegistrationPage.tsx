import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SuccessModal } from "@/components/SuccessModal";

interface FormData {
  name: string;
  city: string;
  country: string;
  aadhaarNumber: string;
  mobileNumber: string;
  acceptTerms: boolean;
}

export default function UserRegistrationPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [farmerId, setFarmerId] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    city: "",
    country: "India",
    aadhaarNumber: "",
    mobileNumber: "",
    acceptTerms: false,
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, city, aadhaarNumber, mobileNumber, acceptTerms } = formData;
    
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
    
    if (!acceptTerms) {
      toast({ title: "Error", description: "Please accept the terms and conditions", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const registrationData = {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        aadhaarNumber: formData.aadhaarNumber,
        mobileNumber: formData.mobileNumber,
        role: "user",
      };

      const response = await apiRequest('POST', '/api/register', registrationData);
      const data = await response.json();

      setFarmerId(data.farmerId);
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

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/role-selection')}
          className="mr-4 text-ag-green p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">{t('user_registration')}</h2>
      </div>
      
      {/* Registration Form */}
      <div className="flex-1 space-y-4">
        {/* Name */}
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
        
        {/* City */}
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
        
        {/* Country */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('country')}</Label>
          <Input
            type="text"
            value={formData.country}
            readOnly
            className="py-4 bg-gray-100"
          />
        </div>
        
        {/* Aadhaar Number */}
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
        
        {/* Mobile Number */}
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
        
        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3 py-4">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
            {t('terms_agreement')}
          </Label>
        </div>
        
        {/* Register Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 font-semibold"
        >
          {t('register')}
        </Button>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message="Registration completed successfully"
        farmerId={farmerId}
      />
    </div>
  );
}
