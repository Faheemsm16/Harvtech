import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Upload, FileText, Calendar, User, Landmark, MapPin, Sprout, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCustomAuth } from "@/context/AuthContext";

// Form validation schemas for each step
const farmerDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  fatherHusbandName: z.string().min(2, "Father's/Husband's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar number must be 12 digits"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  address: z.string().min(10, "Address is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  villagePanchayat: z.string().min(1, "Village Panchayat is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

const landCropDetailsSchema = z.object({
  surveyKhasraNumber: z.string().min(1, "Survey/Khasra number is required"),
  totalLandHolding: z.string().min(1, "Total land holding is required"),
  landOwnership: z.string().min(1, "Land ownership is required"),
  cropSeason: z.string().min(1, "Crop season is required"),
  cropType: z.string().min(1, "Crop type is required"),
  sowingDate: z.string().min(1, "Sowing date is required"),
  expectedHarvestDate: z.string().min(1, "Expected harvest date is required"),
  irrigationType: z.string().min(1, "Irrigation type is required"),
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  accountNumber: z.string().min(8, "Account number is required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
});

const documentUploadSchema = z.object({
  aadhaarDocument: z.any().optional(),
  bankPassbook: z.any().optional(),
  landRecord: z.any().optional(),
  cropPhoto: z.any().optional(),
});

const declarationSchema = z.object({
  declarationAccepted: z.boolean().refine(val => val === true, "You must accept the declaration"),
});

// States and districts data
const statesData = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Karnataka": ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Chamarajanagar", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Yadgir"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"]
};

// Crop options based on season
const cropOptions = {
  Kharif: ["Paddy (Rice)", "Maize (Makka)", "Millets (Jowar, Bajra, Ragi)", "Tur (Arhar)", "Cotton", "Soybean", "Groundnut", "Moong", "Urad"],
  Rabi: ["Wheat", "Barley", "Mustard", "Chana", "Masoor", "Peas", "Linseed", "Oats"],
  Zaid: ["Watermelon", "Muskmelon", "Cucumber", "Pumpkin", "Bitter gourd", "Summer Moong", "Fodder crops", "Sunflower (early)"]
};

export default function InsuranceFinanceForm() {
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const stepSchemas = [
    farmerDetailsSchema,
    landCropDetailsSchema,
    bankDetailsSchema,
    documentUploadSchema,
    declarationSchema
  ];

  const form = useForm({
    resolver: zodResolver(stepSchemas[currentStep - 1]),
    mode: "onChange",
    defaultValues: formData
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/insurance-applications', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-applications'] });
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Your insurance application has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = (data: any) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      form.reset(updatedFormData);
    } else {
      // Final submission
      const finalData = {
        ...updatedFormData,
        userId: user?.id,
        dateOfBirth: new Date(updatedFormData.dateOfBirth),
        sowingDate: new Date(updatedFormData.sowingDate),
        expectedHarvestDate: new Date(updatedFormData.expectedHarvestDate),
      };
      submitMutation.mutate(finalData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      form.reset(formData);
    }
  };

  const handleBack = () => {
    setLocation('/platforms');
  };

  const getStepIcon = (step: number) => {
    const icons = [User, MapPin, Landmark, FileText, CheckCircle];
    const Icon = icons[step - 1];
    return <Icon className="h-5 w-5" />;
  };

  const getStepTitle = (step: number) => {
    const titles = [
      "Farmer Details",
      "Land / Crop Details", 
      "Bank Details",
      "Document Upload",
      "Declaration / Consent"
    ];
    return titles[step - 1];
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-ag-green text-white p-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Application Submitted</h2>
          </div>
        </div>
        
        <div className="flex-1 p-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Success!</h3>
              <p className="text-gray-600 mb-4">
                Your insurance application has been submitted successfully. 
                You will receive updates on your application status.
              </p>
              <Button onClick={handleBack} className="w-full">
                Back to Platforms
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/10 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Insurance & Finance</h2>
            <p className="text-sm opacity-90">Step {currentStep} of 5</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div className={`h-2 rounded-full ${step <= currentStep ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStepIcon(currentStep)}
              <span>{getStepTitle(currentStep)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
              {currentStep === 1 && <FarmerDetailsStep form={form} />}
              {currentStep === 2 && <LandCropDetailsStep form={form} />}
              {currentStep === 3 && <BankDetailsStep form={form} />}
              {currentStep === 4 && <DocumentUploadStep form={form} />}
              {currentStep === 5 && <DeclarationStep form={form} />}
              
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="bg-ag-green hover:bg-ag-green/90"
                >
                  {currentStep === 5 ? (
                    submitMutation.isPending ? "Submitting..." : "Submit Application"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step Components
function FarmerDetailsStep({ form }: { form: any }) {
  const [selectedState, setSelectedState] = useState("");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input id="fullName" {...form.register("fullName")} />
        {form.formState.errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="fatherHusbandName">Father's / Husband's Name *</Label>
        <Input id="fatherHusbandName" {...form.register("fatherHusbandName")} />
        {form.formState.errors.fatherHusbandName && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.fatherHusbandName.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
        {form.formState.errors.dateOfBirth && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateOfBirth.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="gender">Gender *</Label>
        <Select onValueChange={(value) => form.setValue("gender", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.gender && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.gender.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
        <Input id="aadhaarNumber" placeholder="Enter 12-digit Aadhaar number" {...form.register("aadhaarNumber")} />
        {form.formState.errors.aadhaarNumber && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.aadhaarNumber.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="mobileNumber">Mobile Number *</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
            +91
          </span>
          <Input id="mobileNumber" placeholder="Enter 10-digit mobile number" className="rounded-l-none" {...form.register("mobileNumber")} />
        </div>
        {form.formState.errors.mobileNumber && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.mobileNumber.message}</p>
        )}
      </div>
      
      <div className="md:col-span-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea id="address" placeholder="Enter complete address" {...form.register("address")} />
        {form.formState.errors.address && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="state">State *</Label>
        <Select onValueChange={(value) => {
          setSelectedState(value);
          form.setValue("state", value);
          form.setValue("district", ""); // Reset district when state changes
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(statesData).map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.state && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.state.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="district">District *</Label>
        <Select onValueChange={(value) => form.setValue("district", value)} disabled={!selectedState}>
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {selectedState && statesData[selectedState as keyof typeof statesData]?.map(district => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.district && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.district.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="villagePanchayat">Village Panchayat *</Label>
        <Input id="villagePanchayat" {...form.register("villagePanchayat")} />
        {form.formState.errors.villagePanchayat && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.villagePanchayat.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="pincode">Pincode *</Label>
        <Input id="pincode" placeholder="Enter 6-digit pincode" {...form.register("pincode")} />
        {form.formState.errors.pincode && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.pincode.message}</p>
        )}
      </div>
    </div>
  );
}

function LandCropDetailsStep({ form }: { form: any }) {
  const [selectedSeason, setSelectedSeason] = useState("");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="surveyKhasraNumber">Survey / Khasra Number *</Label>
        <Input id="surveyKhasraNumber" {...form.register("surveyKhasraNumber")} />
        {form.formState.errors.surveyKhasraNumber && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.surveyKhasraNumber.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="totalLandHolding">Total Land Holding (in acres/hectares) *</Label>
        <Input id="totalLandHolding" placeholder="e.g., 2.5 acres" {...form.register("totalLandHolding")} />
        {form.formState.errors.totalLandHolding && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.totalLandHolding.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="landOwnership">Land Ownership *</Label>
        <Select onValueChange={(value) => form.setValue("landOwnership", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select ownership type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Owned">Owned</SelectItem>
            <SelectItem value="Leased">Leased</SelectItem>
            <SelectItem value="Tenant">Tenant</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.landOwnership && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.landOwnership.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="cropSeason">Crop Season *</Label>
        <Select onValueChange={(value) => {
          setSelectedSeason(value);
          form.setValue("cropSeason", value);
          form.setValue("cropType", ""); // Reset crop type when season changes
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select crop season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kharif">Kharif</SelectItem>
            <SelectItem value="Rabi">Rabi</SelectItem>
            <SelectItem value="Zaid">Zaid</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.cropSeason && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.cropSeason.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="cropType">Crop Type *</Label>
        <Select onValueChange={(value) => form.setValue("cropType", value)} disabled={!selectedSeason}>
          <SelectTrigger>
            <SelectValue placeholder="Select crop type" />
          </SelectTrigger>
          <SelectContent>
            {selectedSeason && cropOptions[selectedSeason as keyof typeof cropOptions]?.map(crop => (
              <SelectItem key={crop} value={crop}>{crop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.cropType && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.cropType.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="irrigationType">Irrigation Type *</Label>
        <Select onValueChange={(value) => form.setValue("irrigationType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select irrigation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Irrigated">Irrigated</SelectItem>
            <SelectItem value="Rainfed">Rainfed</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.irrigationType && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.irrigationType.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="sowingDate">Sowing Date *</Label>
        <Input id="sowingDate" type="date" {...form.register("sowingDate")} />
        {form.formState.errors.sowingDate && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.sowingDate.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="expectedHarvestDate">Expected Harvest Date *</Label>
        <Input id="expectedHarvestDate" type="date" {...form.register("expectedHarvestDate")} />
        {form.formState.errors.expectedHarvestDate && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.expectedHarvestDate.message}</p>
        )}
      </div>
    </div>
  );
}

function BankDetailsStep({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="bankName">Bank Name *</Label>
        <Input id="bankName" {...form.register("bankName")} />
        {form.formState.errors.bankName && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.bankName.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="branchName">Branch Name *</Label>
        <Input id="branchName" {...form.register("branchName")} />
        {form.formState.errors.branchName && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.branchName.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="accountNumber">Account Number *</Label>
        <Input id="accountNumber" {...form.register("accountNumber")} />
        {form.formState.errors.accountNumber && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.accountNumber.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="ifscCode">IFSC Code *</Label>
        <Input id="ifscCode" placeholder="e.g., SBIN0001234" {...form.register("ifscCode")} />
        {form.formState.errors.ifscCode && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.ifscCode.message}</p>
        )}
      </div>
    </div>
  );
}

function DocumentUploadStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Upload documents in PDF or image format. All documents are optional but recommended for faster processing.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="aadhaarDocument">Aadhaar Card</Label>
          <div className="mt-2">
            <Input id="aadhaarDocument" type="file" accept=".pdf,.jpg,.jpeg,.png" {...form.register("aadhaarDocument")} />
          </div>
        </div>
        
        <div>
          <Label htmlFor="bankPassbook">Bank Passbook</Label>
          <div className="mt-2">
            <Input id="bankPassbook" type="file" accept=".pdf,.jpg,.jpeg,.png" {...form.register("bankPassbook")} />
          </div>
        </div>
        
        <div>
          <Label htmlFor="landRecord">Land Record / Patta</Label>
          <div className="mt-2">
            <Input id="landRecord" type="file" accept=".pdf,.jpg,.jpeg,.png" {...form.register("landRecord")} />
          </div>
        </div>
        
        <div>
          <Label htmlFor="cropPhoto">Crop Photo</Label>
          <div className="mt-2">
            <Input id="cropPhoto" type="file" accept=".jpg,.jpeg,.png" {...form.register("cropPhoto")} />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <Upload className="h-4 w-4 inline mr-2" />
          Documents will be securely stored and used only for verification purposes.
        </p>
      </div>
    </div>
  );
}

function DeclarationStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Declaration and Consent</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>I hereby declare that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All information provided in this application is true and accurate to the best of my knowledge.</li>
            <li>I understand that providing false information may result in rejection of my application.</li>
            <li>I consent to the verification of the information provided through appropriate channels.</li>
            <li>I agree to the terms and conditions of the insurance scheme.</li>
            <li>I authorize the use of my personal data for the purpose of processing this application.</li>
          </ul>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <Checkbox 
          id="declarationAccepted" 
          onCheckedChange={(checked) => form.setValue("declarationAccepted", checked)}
        />
        <label htmlFor="declarationAccepted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I confirm that the information provided above is true to the best of my knowledge. *
        </label>
      </div>
      {form.formState.errors.declarationAccepted && (
        <p className="text-red-500 text-sm">{form.formState.errors.declarationAccepted.message}</p>
      )}
      
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          Once submitted, you will receive a confirmation and be able to track your application status.
        </p>
      </div>
    </div>
  );
}