import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  farmerId?: string;
}

export function SuccessModal({ isOpen, onClose, title, message, farmerId }: SuccessModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <DialogTitle className="text-xl font-bold">
            {title || t('success')}
          </DialogTitle>
          
          <DialogDescription className="text-gray-600">
            {message}
          </DialogDescription>
          
          {farmerId && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">{t('your_farmer_id')}</p>
              <p className="font-mono font-bold text-ag-green">{farmerId}</p>
            </div>
          )}
          
          <Button 
            onClick={onClose} 
            className="w-full bg-ag-green hover:bg-ag-green/90 text-white"
          >
            {t('ok')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
