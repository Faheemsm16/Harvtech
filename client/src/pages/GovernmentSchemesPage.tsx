import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Tag,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface GovernmentScheme {
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

export default function GovernmentSchemesPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleBack = () => {
    setLocation('/platforms');
  };

  const { data: schemes = [], isLoading } = useQuery({
    queryKey: ['/api/government-schemes'],
    queryFn: async () => {
      const response = await fetch('/api/government-schemes');
      if (!response.ok) throw new Error('Failed to fetch government schemes');
      return response.json() as GovernmentScheme[];
    }
  });

  const handleNextCard = () => {
    if (currentCardIndex < schemes.length - 1) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
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
              <h2 className="text-lg font-semibold">Government Schemes</h2>
              <p className="text-sm opacity-90">Loading schemes...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ag-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading government schemes...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentScheme = schemes[currentCardIndex];

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
            <h2 className="text-lg font-semibold">Government Schemes</h2>
            <p className="text-sm opacity-90">Browse available government schemes</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4">
        {schemes.length > 0 && (
          <>
            {/* Card Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {currentCardIndex + 1} of {schemes.length}
                </span>
                {/* Progress dots */}
                <div className="flex space-x-1">
                  {schemes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCardIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentCardIndex ? 'bg-ag-green' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextCard}
                disabled={currentCardIndex === schemes.length - 1}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Current Scheme Card */}
            <Card className="bg-white shadow-lg border border-gray-200 mx-auto max-w-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="h-4 w-4 text-ag-green" />
                      <span className="text-xs font-medium text-ag-green bg-ag-green/10 px-2 py-1 rounded-full">
                        {currentScheme.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {currentScheme.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                      {currentScheme.schemeActualName}
                    </p>
                  </div>
                  <div className="ml-4 text-center">
                    {getEligibilityIcon(currentScheme.eligibilityStatus)}
                    <span 
                      className={`mt-2 block text-xs px-2 py-1 rounded-full font-medium ${
                        currentScheme.eligibilityStatus === 'eligible' 
                          ? 'bg-green-100 text-green-800' 
                          : currentScheme.eligibilityStatus === 'partially-eligible'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {getEligibilityText(currentScheme.eligibilityStatus)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Eligibility */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">Who can apply:</h4>
                  <p className="text-gray-600 text-sm">{currentScheme.eligibility}</p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">What you get:</h4>
                  <p className="text-gray-600 text-sm font-medium">{currentScheme.whatTheyGet}</p>
                </div>

                {/* Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">How it works:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{currentScheme.details}</p>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {currentScheme.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button 
                    className={`w-full ${
                      currentScheme.eligibilityStatus === 'not-eligible'
                        ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                        : 'bg-ag-green hover:bg-ag-green/90'
                    } text-white`}
                    onClick={() => {
                      if (currentScheme.eligibilityStatus !== 'not-eligible') {
                        window.open(currentScheme.linkToApply, '_blank');
                      }
                    }}
                    disabled={currentScheme.eligibilityStatus === 'not-eligible'}
                  >
                    {currentScheme.eligibilityStatus === 'eligible' 
                      ? 'Apply Now - Visit Official Website' 
                      : currentScheme.eligibilityStatus === 'partially-eligible' 
                      ? 'Check Eligibility - Visit Official Website' 
                      : 'Not Eligible for This Scheme'
                    }
                    {currentScheme.eligibilityStatus !== 'not-eligible' && (
                      <ExternalLink className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}