import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCustomAuth } from '@/context/AuthContext';
import { isUnauthorizedError } from '@/lib/authUtils';
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  FileText,
  IndianRupee,
  Calendar,
  Users
} from 'lucide-react';

interface InsuranceOption {
  id: string;
  name: string;
  category: string;
  schemeActualName: string;
  eligibility: string;
  whatTheyGet: string;
  details: string;
  linkToApply: string;
  eligibilityStatus: 'eligible' | 'partially-eligible' | 'not-eligible';
  tags: string[];
}

export default function InsuranceFinancePage() {
  const [, setLocation] = useLocation();
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState<InsuranceOption[]>([]);

  // Check if user has completed insurance application
  const { data: currentApplication, isLoading: isApplicationLoading, error: applicationError } = useQuery({
    queryKey: ['/api/insurance-applications/current'],
    enabled: !!user,
    retry: false,
  });

  // Handle authentication errors
  useEffect(() => {
    if (applicationError && isUnauthorizedError(applicationError as Error)) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [applicationError, toast]);

  // Fetch insurance options
  const { data: insuranceOptions = [], isLoading: isOptionsLoading } = useQuery({
    queryKey: ['/api/insurance-options'],
  });

  // Filter insurance options based on search
  useEffect(() => {
    if (!insuranceOptions.length) return;
    
    if (!searchQuery.trim()) {
      setFilteredOptions(insuranceOptions);
      return;
    }

    const filtered = insuranceOptions.filter((option: InsuranceOption) => {
      const query = searchQuery.toLowerCase();
      return (
        option.name.toLowerCase().includes(query) ||
        option.category.toLowerCase().includes(query) ||
        option.schemeActualName.toLowerCase().includes(query) ||
        option.details.toLowerCase().includes(query) ||
        option.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    setFilteredOptions(filtered);
    setCurrentCardIndex(0);
  }, [searchQuery, insuranceOptions]);

  const handleBack = () => {
    setLocation('/platforms');
  };

  const handleEditDetails = () => {
    setLocation('/insurance-finance/form');
  };

  const handleNextCard = () => {
    if (currentCardIndex < filteredOptions.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const getEligibilityIcon = (status: string) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partially-eligible':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'not-eligible':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEligibilityText = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'Eligible';
      case 'partially-eligible':
        return 'Partially Eligible';
      case 'not-eligible':
        return 'Not Eligible';
      default:
        return 'Unknown';
    }
  };

  // Use effect to handle redirect to avoid state update during render
  useEffect(() => {
    if (!isApplicationLoading && !currentApplication && user) {
      setLocation('/insurance-finance/form');
    }
  }, [isApplicationLoading, currentApplication, user, setLocation]);

  // Skip redirect check during loading or if no user (show options directly)
  const shouldShowForm = !isApplicationLoading && user && !currentApplication;

  if (isApplicationLoading || isOptionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ag-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insurance options...</p>
        </div>
      </div>
    );
  }

  // Show the main insurance page regardless of authentication status
  if (shouldShowForm) {
    return null; // The useEffect will handle the redirect
  }

  const currentOption = filteredOptions[currentCardIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Insurance & Finance</h2>
              <p className="text-sm opacity-90">Explore available insurance options</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleEditDetails}
            className="text-white hover:bg-white/10"
            size="sm"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search insurance options, categories, or benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Insurance Cards */}
      <div className="flex-1 p-4">
        {filteredOptions.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No insurance options found</p>
            <p className="text-sm text-gray-500">Try adjusting your search terms</p>
          </div>
        ) : (
          <>
            {/* Card Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {currentCardIndex + 1} of {filteredOptions.length}
                </span>
                <div className="flex space-x-1">
                  {filteredOptions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentCardIndex ? 'bg-ag-green' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextCard}
                  disabled={currentCardIndex === filteredOptions.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Insurance Card */}
            {currentOption && (
              <Card className="mb-4">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{currentOption.name}</CardTitle>
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full mb-3">
                        {currentOption.category}
                      </span>
                      <p className="text-gray-600 text-sm leading-relaxed font-medium">
                        {currentOption.schemeActualName}
                      </p>
                    </div>
                    <div className="ml-4 text-center">
                      {getEligibilityIcon(currentOption.eligibilityStatus)}
                      <span 
                        className={`mt-2 block text-xs px-2 py-1 rounded-full font-medium ${
                          currentOption.eligibilityStatus === 'eligible' 
                            ? 'bg-green-100 text-green-800' 
                            : currentOption.eligibilityStatus === 'partially-eligible'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getEligibilityText(currentOption.eligibilityStatus)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-ag-green" />
                      What This Scheme Offers
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentOption.details}
                    </p>
                  </div>

                  {/* Key Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 text-ag-green mr-2" />
                        <span className="font-medium text-sm">Eligibility</span>
                      </div>
                      <p className="text-sm text-gray-600">{currentOption.eligibility}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <IndianRupee className="h-4 w-4 text-ag-green mr-2" />
                        <span className="font-medium text-sm">What You Get</span>
                      </div>
                      <p className="text-sm text-gray-600">{currentOption.whatTheyGet}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-ag-green" />
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentOption.tags.map((tag, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button 
                      className={`w-full ${
                        currentOption.eligibilityStatus === 'not-eligible'
                          ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                          : 'bg-ag-green hover:bg-ag-green/90'
                      } text-white`}
                      onClick={() => {
                        if (currentOption.eligibilityStatus !== 'not-eligible') {
                          window.open(currentOption.linkToApply, '_blank');
                        }
                      }}
                      disabled={currentOption.eligibilityStatus === 'not-eligible'}
                    >
                      {currentOption.eligibilityStatus === 'eligible' 
                        ? 'Apply Now - Visit Official Website' 
                        : currentOption.eligibilityStatus === 'partially-eligible' 
                        ? 'Check Eligibility - Visit Official Website' 
                        : 'Not Eligible for This Scheme'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Swipe Hint */}
            <div className="text-center text-xs text-gray-500 mt-4">
              Swipe left or right to explore more insurance options
            </div>
          </>
        )}
      </div>
    </div>
  );
}