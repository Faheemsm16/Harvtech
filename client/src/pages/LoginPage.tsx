import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCustomAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useCustomAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if mobile number is registered
      const checkResponse = await apiRequest('POST', '/api/check-mobile', {
        mobileNumber
      });
      const data = await checkResponse.json();

      if (!data.isRegistered) {
        toast({
          title: "Not Registered",
          description: "Mobile number not registered. Please register first.",
          variant: "destructive",
        });
        return;
      }

      // Send OTP
      await apiRequest('POST', '/api/send-otp', { mobileNumber });
      setShowOtpSection(true);
      
      toast({
        title: "OTP Sent",
        description: "Please enter the OTP sent to your mobile number",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/verify-otp', {
        mobileNumber,
        otp
      });
      const data = await response.json();

      if (data.success) {
        // Login user with custom auth context
        login(data.user);
        
        // Redirect based on user role
        if (data.user.role === 'user') {
          setLocation('/user-dashboard');
        } else {
          setLocation('/owner-dashboard');
        }
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please check your OTP and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold">{t('welcome_back')}</h2>
      </div>
      
      {/* Login Form */}
      <div className="flex-1 space-y-6">
        {/* Mobile Number Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('mobile_number')}</Label>
          <div className="flex">
            <div className="bg-gray-100 px-3 py-3 rounded-l-xl border border-r-0 border-gray-300 flex items-center">
              <span className="text-gray-600">+91</span>
            </div>
            <Input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              maxLength={10}
              className="flex-1 rounded-l-none border-l-0 py-6 focus:ring-2 focus:ring-ag-green"
            />
          </div>
        </div>
        
        {/* Send OTP Button */}
        <Button 
          onClick={sendOTP}
          disabled={isLoading}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-6 font-semibold"
        >
          {t('send_otp')}
        </Button>
        
        {/* OTP Input */}
        {showOtpSection && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('enter_otp')}</Label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP (use 123456 for demo)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full py-6 text-center text-xl tracking-widest focus:ring-2 focus:ring-ag-green"
              />
            </div>
            <Button 
              onClick={verifyOTP}
              disabled={isLoading}
              className="w-full bg-ag-orange hover:bg-ag-orange/90 text-white py-6 font-semibold"
            >
              {t('verify_otp')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
