import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCustomAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  MapPin, 
  Landmark, 
  FileText, 
  CheckCircle,
  Save,
  AlertCircle
} from 'lucide-react';

// Form validation schemas for each step
const farmerDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  fatherHusbandName: z.string().min(2, "Father/Husband name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(['Male', 'Female'], { required_error: "Gender is required" }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  address: z.string().min(10, "Complete address is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  villagePanchayat: z.string().min(2, "Village/Panchayat is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits")
});

const landCropDetailsSchema = z.object({
  surveyKhasraNumber: z.string().min(1, "Survey/Khasra number is required"),
  totalLandHolding: z.string().min(1, "Total land holding is required"),
  landOwnership: z.enum(['Owned', 'Leased', 'Tenant'], { required_error: "Land ownership type is required" }),
  cropSeason: z.enum(['Kharif', 'Rabi', 'Zaid'], { required_error: "Crop season is required" }),
  cropType: z.string().min(2, "Crop type is required"),
  sowingDate: z.string().min(1, "Sowing date is required"),
  expectedHarvestDate: z.string().min(1, "Expected harvest date is required"),
  irrigationType: z.enum(['Irrigated', 'Rainfed'], { required_error: "Irrigation type is required" })
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  branchName: z.string().min(2, "Branch name is required"),
  accountNumber: z.string().min(8, "Valid account number is required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Valid IFSC code is required")
});

const documentUploadSchema = z.object({
  aadhaarDocumentUrl: z.string().optional(),
  bankPassbookUrl: z.string().optional(),
  landRecordUrl: z.string().optional(),
  cropPhotoUrl: z.string().optional()
});

const declarationSchema = z.object({
  declarationAccepted: z.boolean().refine(val => val === true, "You must accept the declaration")
});

export default function InsuranceFinanceForm() {
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load existing application data
  const { data: existingApplication } = useQuery({
    queryKey: ['/api/insurance-applications/current'],
    enabled: !!user,
    retry: false,
  });

  // Initialize form data with existing application
  useEffect(() => {
    if (existingApplication) {
      const existingData = {
        fullName: existingApplication.fullName || '',
        fatherHusbandName: existingApplication.fatherHusbandName || '',
        dateOfBirth: existingApplication.dateOfBirth ? new Date(existingApplication.dateOfBirth).toISOString().split('T')[0] : '',
        gender: existingApplication.gender || '',
        aadhaarNumber: existingApplication.aadhaarNumber || '',
        mobileNumber: existingApplication.mobileNumber || '',
        address: existingApplication.address || '',
        state: existingApplication.state || '',
        district: existingApplication.district || '',
        villagePanchayat: existingApplication.villagePanchayat || '',
        pincode: existingApplication.pincode || '',
        surveyKhasraNumber: existingApplication.surveyKhasraNumber || '',
        totalLandHolding: existingApplication.totalLandHolding || '',
        landOwnership: existingApplication.landOwnership || '',
        cropSeason: existingApplication.cropSeason || '',
        cropType: existingApplication.cropType || '',
        sowingDate: existingApplication.sowingDate ? new Date(existingApplication.sowingDate).toISOString().split('T')[0] : '',
        expectedHarvestDate: existingApplication.expectedHarvestDate ? new Date(existingApplication.expectedHarvestDate).toISOString().split('T')[0] : '',
        irrigationType: existingApplication.irrigationType || '',
        bankName: existingApplication.bankName || '',
        branchName: existingApplication.branchName || '',
        accountNumber: existingApplication.accountNumber || '',
        ifscCode: existingApplication.ifscCode || '',
        aadhaarDocumentUrl: existingApplication.aadhaarDocumentUrl || '',
        bankPassbookUrl: existingApplication.bankPassbookUrl || '',
        landRecordUrl: existingApplication.landRecordUrl || '',
        cropPhotoUrl: existingApplication.cropPhotoUrl || '',
        declarationAccepted: existingApplication.declarationAccepted || false
      };
      setFormData(existingData);
    }
  }, [existingApplication]);

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
    defaultValues: {
      fullName: '',
      fatherHusbandName: '',
      dateOfBirth: '',
      gender: '',
      aadhaarNumber: '',
      mobileNumber: '',
      address: '',
      state: '',
      district: '',
      villagePanchayat: '',
      pincode: '',
      surveyKhasraNumber: '',
      totalLandHolding: '',
      landOwnership: '',
      cropSeason: '',
      cropType: '',
      sowingDate: '',
      expectedHarvestDate: '',
      irrigationType: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifscCode: '',
      aadhaarDocumentUrl: '',
      bankPassbookUrl: '',
      landRecordUrl: '',
      cropPhotoUrl: '',
      declarationAccepted: false,
      ...formData
    }
  });

  // Auto-save mutation for intermediate steps
  const autoSaveMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/insurance-applications', 'POST', { ...data, status: 'draft' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-applications/current'] });
      toast({
        title: "Progress Saved",
        description: "Your form data has been auto-saved.",
      });
    }
  });

  // Final submission mutation
  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/insurance-applications', 'POST', { ...data, status: 'submitted' }),
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
    
    // Auto-save for steps 1-4
    if (currentStep < 5) {
      // Only auto-save if user is authenticated, otherwise just proceed
      if (user) {
        const saveData = {
          ...updatedFormData,
          userId: user.id,
          dateOfBirth: updatedFormData.dateOfBirth ? new Date(updatedFormData.dateOfBirth) : undefined,
          sowingDate: updatedFormData.sowingDate ? new Date(updatedFormData.sowingDate) : undefined,
          expectedHarvestDate: updatedFormData.expectedHarvestDate ? new Date(updatedFormData.expectedHarvestDate) : undefined,
        };
        
        autoSaveMutation.mutate(saveData);
      } else {
        // Show auto-save message in demo mode
        toast({
          title: "Progress Saved",
          description: "Your form data has been saved locally.",
        });
      }
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      if (user) {
        const finalData = {
          ...updatedFormData,
          userId: user.id,
          dateOfBirth: new Date(updatedFormData.dateOfBirth),
          sowingDate: new Date(updatedFormData.sowingDate),
          expectedHarvestDate: new Date(updatedFormData.expectedHarvestDate),
        };
        submitMutation.mutate(finalData);
      } else {
        // Demo mode - show success without saving
        toast({
          title: "Application Submitted Successfully!",
          description: "Your insurance application has been completed. In production, this would be saved to your account.",
        });
        setIsSubmitted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBack = () => {
    if (existingApplication && existingApplication.status === 'submitted') {
      setLocation('/insurance-finance');
    } else {
      setLocation('/platforms');
    }
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

  // Reset form when data changes and step changes
  useEffect(() => {
    const currentValues = {
      fullName: formData.fullName || '',
      fatherHusbandName: formData.fatherHusbandName || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || '',
      aadhaarNumber: formData.aadhaarNumber || '',
      mobileNumber: formData.mobileNumber || '',
      address: formData.address || '',
      state: formData.state || '',
      district: formData.district || '',
      villagePanchayat: formData.villagePanchayat || '',
      pincode: formData.pincode || '',
      surveyKhasraNumber: formData.surveyKhasraNumber || '',
      totalLandHolding: formData.totalLandHolding || '',
      landOwnership: formData.landOwnership || '',
      cropSeason: formData.cropSeason || '',
      cropType: formData.cropType || '',
      sowingDate: formData.sowingDate || '',
      expectedHarvestDate: formData.expectedHarvestDate || '',
      irrigationType: formData.irrigationType || '',
      bankName: formData.bankName || '',
      branchName: formData.branchName || '',
      accountNumber: formData.accountNumber || '',
      ifscCode: formData.ifscCode || '',
      aadhaarDocumentUrl: formData.aadhaarDocumentUrl || '',
      bankPassbookUrl: formData.bankPassbookUrl || '',
      landRecordUrl: formData.landRecordUrl || '',
      cropPhotoUrl: formData.cropPhotoUrl || '',
      declarationAccepted: formData.declarationAccepted || false,
    };
    form.reset(currentValues);
  }, [currentStep]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-ag-green text-white p-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Application Submitted</h2>
              <p className="text-sm opacity-90">Your insurance application is complete</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">
                Your insurance application has been submitted successfully. You can now browse available insurance options.
              </p>
              <Button 
                onClick={() => setLocation('/insurance-finance')} 
                className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
              >
                View Insurance Options
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
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Insurance Application</h2>
            <p className="text-sm opacity-90">Step {currentStep} of 5: {getStepTitle(currentStep)}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2
                ${step <= currentStep ? 'bg-ag-green text-white border-ag-green' : 'bg-gray-100 text-gray-400 border-gray-300'}
              `}>
                {step < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  getStepIcon(step)
                )}
              </div>
              <span className="text-xs text-center font-medium">
                {getStepTitle(step)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStepIcon(currentStep)}
              <span>{getStepTitle(currentStep)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
                {/* Step 1: Farmer Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fatherHusbandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father/Husband Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter father/husband name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aadhaarNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aadhaar Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter 12-digit Aadhaar number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter 10-digit mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your complete address"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter district" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="villagePanchayat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Village/Panchayat *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter village/panchayat" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 6-digit pincode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Land/Crop Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="surveyKhasraNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Survey/Khasra Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter survey/khasra number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="totalLandHolding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Land Holding *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2.5 acres" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="landOwnership"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Land Ownership *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ownership type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Owned">Owned</SelectItem>
                                <SelectItem value="Leased">Leased</SelectItem>
                                <SelectItem value="Tenant">Tenant</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cropSeason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crop Season *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select crop season" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Kharif">Kharif (Jun-Oct)</SelectItem>
                                <SelectItem value="Rabi">Rabi (Nov-Apr)</SelectItem>
                                <SelectItem value="Zaid">Zaid (Apr-Jun)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cropType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Rice, Wheat, Cotton, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sowingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sowing Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expectedHarvestDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Harvest Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="irrigationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Irrigation Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select irrigation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Irrigated">Irrigated</SelectItem>
                              <SelectItem value="Rainfed">Rainfed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Bank Details */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Branch Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter branch name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter IFSC code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Document Upload */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Document Upload Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Required Documents
                      </h4>
                      <p className="text-sm text-blue-800 mb-4">
                        Please upload or provide URLs for the following documents. You can also upload them later if needed.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {/* Aadhaar Document */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-gray-900">Aadhaar Card</label>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Required</span>
                          </div>
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Click to upload or drag files here</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                            </div>
                            <FormField
                              control={form.control}
                              name="aadhaarDocumentUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">Or provide URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/aadhaar.pdf" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Bank Passbook */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-gray-900">Bank Passbook / Statement</label>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Required</span>
                          </div>
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Click to upload or drag files here</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                            </div>
                            <FormField
                              control={form.control}
                              name="bankPassbookUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">Or provide URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/passbook.pdf" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Land Records */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-gray-900">Land Records / Revenue Document</label>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Required</span>
                          </div>
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Click to upload or drag files here</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                            </div>
                            <FormField
                              control={form.control}
                              name="landRecordUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">Or provide URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/landrecord.pdf" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Crop Photo */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-gray-900">Crop Photo</label>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Optional</span>
                          </div>
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Click to upload or drag files here</p>
                              <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                            </div>
                            <FormField
                              control={form.control}
                              name="cropPhotoUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">Or provide URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/crop.jpg" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Note:</strong> File upload functionality is being implemented. For now, you can provide document URLs or continue without uploading - you can always add documents later through your application dashboard.
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Declaration */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 mb-4">Declaration and Consent</h4>
                      <div className="space-y-3 text-sm text-blue-800">
                        <p>I hereby declare that:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li>All information provided in this application is true and accurate to the best of my knowledge.</li>
                          <li>I am the rightful owner/tenant/lessee of the land mentioned in this application.</li>
                          <li>The crop details provided are accurate and the crop has been/will be sown as mentioned.</li>
                          <li>I understand that any false information may lead to rejection of my insurance claim.</li>
                          <li>I consent to the processing of my personal data for insurance purposes.</li>
                          <li>I agree to abide by all terms and conditions of the insurance scheme.</li>
                        </ul>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="declarationAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              I accept the declaration and consent *
                            </FormLabel>
                            <p className="text-sm text-gray-600">
                              By checking this box, you agree to all the terms mentioned above.
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormMessage />
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    type="submit"
                    className="bg-ag-green hover:bg-ag-green/90 text-white"
                    disabled={submitMutation.isPending || autoSaveMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      "Submitting..."
                    ) : currentStep === 5 ? (
                      "Submit Application"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Auto-save indicator */}
                {autoSaveMutation.isPending && (
                  <div className="flex items-center justify-center text-sm text-gray-600 mt-2">
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Auto-saving...
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}