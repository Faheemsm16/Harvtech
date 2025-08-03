import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Scheme {
  id: string;
  name: string;
  objective: string;
  eligibility: string;
  benefits: string;
  link: string;
}

interface SchemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const governmentSchemes: Scheme[] = [
  {
    id: "1",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    objective: "To provide income support to farmer families to supplement their financial needs for procuring inputs related to agriculture and allied activities.",
    eligibility: "All farmer families holding cultivable land, except certain exclusions like institutional landholders, farmers who are income tax payers, etc.",
    benefits: "₹6,000 per year in three equal installments of ₹2,000 each, directly transferred to farmers' bank accounts.",
    link: "https://pmkisan.gov.in/"
  },
  {
    id: "2",
    name: "Kisan Credit Card (KCC)",
    objective: "To provide adequate and timely credit support from the banking system to farmers for comprehensive credit requirements.",
    eligibility: "All farmers including tenant farmers, oral lessees, and sharecroppers.",
    benefits: "Credit limit based on operational land holding, flexible repayment, subsidized interest rates.",
    link: "https://pmkisan.gov.in/Rpo_Kcc.aspx"
  },
  {
    id: "3",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    objective: "To provide insurance coverage and financial support to farmers in case of failure of crops due to natural calamities.",
    eligibility: "All farmers growing notified crops in notified areas during the season who have insurable interest in the crop.",
    benefits: "Comprehensive risk insurance covering yield losses due to natural calamities, pests, and diseases.",
    link: "https://pmfby.gov.in/"
  },
  {
    id: "4",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    objective: "To increase the reach of farm mechanization to small and marginal farmers and to regions where availability is low.",
    eligibility: "Individual farmers, FPOs, cooperative societies, and custom hiring centers.",
    benefits: "Financial assistance for purchase of agricultural machinery and equipment ranging from 25% to 80% of the cost.",
    link: "https://agrimachinery.nic.in/"
  },
  {
    id: "5",
    name: "National Mission for Sustainable Agriculture (NMSA)",
    objective: "To make agriculture more productive, sustainable, remunerative and climate resilient.",
    eligibility: "All farmers with focus on rainfed areas and those practicing sustainable agriculture.",
    benefits: "Support for climate resilient practices, water conservation, soil fertility management.",
    link: "https://nmsa.dac.gov.in/"
  },
  {
    id: "6",
    name: "Tamil Nadu Agricultural Input Subsidy Scheme",
    objective: "To provide financial assistance for agricultural inputs to reduce cost of cultivation.",
    eligibility: "Small and marginal farmers in Tamil Nadu with valid land records.",
    benefits: "Subsidy on seeds, fertilizers, pesticides, and agricultural equipment.",
    link: "https://www.tn.gov.in/scheme/data_view/7142"
  }
];

export function SchemesModal({ isOpen, onClose }: SchemesModalProps) {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const { t, currentLanguage } = useLanguage();

  const handleSchemeClick = (scheme: Scheme) => {
    setSelectedScheme(scheme);
  };

  const handleBackToList = () => {
    setSelectedScheme(null);
  };

  const handleApplyClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {selectedScheme && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="p-1 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <span>
              {selectedScheme ? selectedScheme.name : (t('government_schemes') || 'Government Schemes')}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-96">
          {!selectedScheme ? (
            // Schemes List
            <div className="space-y-3">
              {governmentSchemes.map((scheme) => (
                <Card 
                  key={scheme.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSchemeClick(scheme)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-2">{scheme.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {scheme.objective.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Scheme Details
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-ag-green">Objective</h4>
                <p className="text-sm text-gray-700">{selectedScheme.objective}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2 text-ag-green">Eligibility</h4>
                <p className="text-sm text-gray-700">{selectedScheme.eligibility}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2 text-ag-green">Benefits</h4>
                <p className="text-sm text-gray-700">{selectedScheme.benefits}</p>
              </div>
              
              <Button 
                onClick={() => handleApplyClick(selectedScheme.link)}
                className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </div>
          )}
        </ScrollArea>
        
        {!selectedScheme && (
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}