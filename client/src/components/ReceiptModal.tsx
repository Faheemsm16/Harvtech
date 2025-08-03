import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentName: string;
  advanceAmount: number;
  farmerId: string;
  bookingId: string;
  paymentDate: Date;
}

export function ReceiptModal({ 
  isOpen, 
  onClose, 
  equipmentName, 
  advanceAmount, 
  farmerId, 
  bookingId, 
  paymentDate 
}: ReceiptModalProps) {
  const { t } = useLanguage();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-600">Payment Successful!</span>
          </DialogTitle>
        </DialogHeader>
        
        <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-ag-green">HARVTECH</h3>
              <p className="text-sm text-gray-600">Agricultural Equipment Rental</p>
              <p className="text-xs text-gray-500">Receipt</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Equipment:</span>
                <span className="font-medium">{equipmentName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Farmer ID:</span>
                <span className="font-mono text-xs">{farmerId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-xs">{bookingId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="text-xs">{formatDate(paymentDate)}</span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Advance Payment:</span>
                <span className="text-lg font-bold text-ag-green">₹{advanceAmount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="text-green-600 font-medium">PAID</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500 text-center">
                This is an advance payment receipt. Final payment will be collected upon equipment return.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          onClick={onClose}
          className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
        >
          Continue to Dashboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}