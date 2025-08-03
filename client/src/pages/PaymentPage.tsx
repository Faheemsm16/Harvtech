import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QRCode } from "@/components/QRCode";
import { ReceiptModal } from "@/components/ReceiptModal";
import { useCustomAuth } from "@/context/AuthContext";

interface Equipment {
  id: string;
  name: string;
  pricePerDay: number;
}

export default function PaymentPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { equipmentId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useCustomAuth();
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  
  const ADVANCE_AMOUNT = 50; // Fixed advance amount

  const { data: equipment, isLoading } = useQuery<Equipment>({
    queryKey: ['/api/equipment/details', equipmentId],
    enabled: !!equipmentId,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/bookings'] });
      setBookingData(data);
      setShowReceipt(true);
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmPayment = async () => {
    if (!equipment || !user) return;

    const bookingDataPayload = {
      equipmentId: equipment.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
      totalCost: ADVANCE_AMOUNT, // Fixed advance amount
      securityDeposit: 0, // No security deposit for advance
    };

    createBookingMutation.mutate(bookingDataPayload);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setLocation('/user-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading equipment details...</div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Equipment not found</div>
      </div>
    );
  }

  const totalCost = ADVANCE_AMOUNT; // Fixed advance amount

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-ag-green text-white p-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{t('payment')}</h2>
        </div>
      </div>
      
      {/* Payment Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Order Summary */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">{t('order_summary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('equipment')}:</span>
                <span>{equipment.name}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('booking_type')}:</span>
                <span>Advance Booking</span>
              </div>
              <div className="flex justify-between">
                <span>{t('advance_amount')}:</span>
                <span className="text-ag-green font-semibold">₹{ADVANCE_AMOUNT}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Full rental (₹{equipment.pricePerDay}/day):</span>
                <span>Pay on pickup</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>{t('total')}:</span>
                <span>₹{totalCost}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* QR Code Payment */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-4">{t('scan_qr')}</h3>
            
            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <QRCode value={`upi://pay?pa=harvtech@paytm&pn=HARVTECH&mc=0000&tid=txn${Date.now()}&tr=booking${equipmentId}&tn=Equipment Advance Payment&am=${ADVANCE_AMOUNT}&cu=INR`} size={200} />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{t('payment_instruction')}</p>
            
            {/* Payment Confirmation Button */}
            <Button 
              onClick={confirmPayment}
              disabled={createBookingMutation.isPending}
              className="w-full bg-ag-green hover:bg-ag-green/90 text-white py-4 font-semibold"
            >
              {createBookingMutation.isPending ? 'Processing...' : t('confirm_payment')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {bookingData && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={handleReceiptClose}
          equipmentName={equipment?.name || ''}
          advanceAmount={ADVANCE_AMOUNT}
          farmerId={user?.farmerId || ''}
          bookingId={bookingData.id}
          paymentDate={new Date()}
        />
      )}
    </div>
  );
}
