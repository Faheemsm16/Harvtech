import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsAndConditions({ isOpen, onClose, onAccept }: TermsAndConditionsProps) {
  const { t, currentLanguage } = useLanguage();

  const termsContent = {
    english: {
      title: "Terms and Conditions",
      content: `
**HARVTECH - Terms and Conditions for Agricultural Equipment Leasing**

**1. ACCEPTANCE OF TERMS**
By registering with HARVTECH and using our agricultural equipment leasing platform, you agree to be bound by these Terms and Conditions.

**2. DEFINITIONS**
- "Platform" refers to the HARVTECH mobile application and web services
- "Equipment" refers to agricultural machinery including tractors, weeders, and tillers
- "Owner" refers to individuals who list their equipment for lease
- "User" refers to farmers who lease equipment through the platform

**3. USER REGISTRATION**
- All users must provide accurate and complete information during registration
- You must be at least 18 years old to use this platform
- Valid Aadhaar number and mobile number verification is mandatory
- Each user is assigned a unique Farmer ID for identification

**4. EQUIPMENT LEASING**
- Equipment availability is subject to owner discretion
- All rental agreements are between Users and Owners
- HARVTECH acts as a facilitating platform only
- Security deposits are required for all equipment rentals

**5. PAYMENT TERMS**
- All payments must be made through the platform's approved payment methods
- Security deposits will be refunded upon safe return of equipment
- Late fees may apply for overdue returns

**6. USER RESPONSIBILITIES**
- Users must handle all equipment with reasonable care
- Any damage to equipment must be reported immediately
- Users are liable for repair costs of damaged equipment
- Equipment must be returned on the agreed date and time

**7. OWNER RESPONSIBILITIES**
- Owners must ensure equipment is in good working condition
- Accurate equipment descriptions and pricing must be provided
- Equipment must be made available as per booking confirmations

**8. PRIVACY POLICY**
- We collect and use personal information to facilitate equipment leasing
- Mobile numbers and Aadhaar information are kept secure and confidential
- Location data may be used to connect Users with nearby equipment

**9. LIMITATION OF LIABILITY**
- HARVTECH is not liable for equipment damage, accidents, or injuries
- All equipment use is at the User's own risk
- Maximum liability is limited to the transaction amount

**10. DISPUTE RESOLUTION**
- All disputes will be resolved through mediation first
- Legal disputes fall under Indian jurisdiction
- Tamil Nadu state laws apply to all agreements

**11. TERMINATION**
- HARVTECH reserves the right to terminate accounts for policy violations
- Users may delete their accounts at any time

**12. MODIFICATIONS**
- These terms may be updated periodically
- Continued use constitutes acceptance of modified terms

By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by all conditions stated above.

Last updated: January 2024
      `
    },
    tamil: {
      title: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
      content: `
**ஹார்வ்டெக் - விவசாய கருவி குத்தகைக்கான விதிமுறைகள் மற்றும் நிபந்தனைகள்**

**1. விதிமுறைகளின் ஏற்றுக்கொள்ளல்**
ஹார்வ்டெக்கில் பதிவு செய்வதன் மூலமும், எங்கள் விவசாய கருவி குத்தகை தளத்தைப் பயன்படுத்துவதன் மூலமும், இந்த விதிமுறைகள் மற்றும் நிபந்தனைகளுக்கு நீங்கள் கட்டுப்படுவதை ஒப்புக்கொள்கிறீர்கள்.

**2. வரையறைகள்**
- "தளம்" என்பது ஹார்வ்டெக் மொபைல் செயலியை மற்றும் வலை சேவைகளைக் குறிக்கிறது
- "கருவி" என்பது டிராக்டர், களை நீக்கி மற்றும் உழவர் உள்ளிட்ட விவசாய இயந்திரங்களைக் குறிக்கிறது
- "உரிமையாளர்" என்பது தங்கள் கருவிகளை குத்தகைக்கு பட்டியலிடும் நபர்களைக் குறிக்கிறது
- "பயனர்" என்பது தளத்தின் மூலம் கருவிகளை குத்தகைக்கு எடுக்கும் விவசாயிகளைக் குறிக்கிறது

**3. பயனர் பதிவு**
- அனைத்து பயனர்களும் பதிவின் போது துல்லியமான மற்றும் முழுமையான தகவல்களை வழங்க வேண்டும்
- இந்த தளத்தைப் பயன்படுத்த நீங்கள் குறைந்தது 18 வயது இருக்க வேண்டும்
- சரியான ஆதார் எண் மற்றும் மொபைல் எண் சரிபார்ப்பு கட்டாயம்
- ஒவ்வொரு பயனருக்கும் அடையாளத்திற்காக ஒரு தனித்துவமான விவசாயி ஐடி வழங்கப்படுகிறது

**4. கருவி குத்தகை**
- கருவி கிடைக்கும் தன்மை உரிமையாளரின் விருப்பத்திற்கு உட்பட்டது
- அனைத்து வாடகை ஒப்பந்தங்களும் பயனர்கள் மற்றும் உரிமையாளர்களுக்கு இடையில் உள்ளன
- ஹார்வ்டெக் ஒரு வசதி தளமாக மட்டுமே செயல்படுகிறது
- அனைத்து கருவி வாடகைகளுக்கும் பாதுகாப்பு வைப்பு தேவை

**5. கட்டண விதிமுறைகள்**
- அனைத்து கட்டணங்களும் தளத்தின் அங்கீகரிக்கப்பட்ட கட்டண முறைகள் மூலம் செலுத்தப்பட வேண்டும்
- கருவியின் பாதுகாப்பான திரும்பலின் போது பாதுகாப்பு வைப்பு திரும்பப் பெறப்படும்
- தாமதமான திரும்பலுக்கு தாமத கட்டணம் விதிக்கப்படலாம்

**6. பயனர் பொறுப்புகள்**
- பயனர்கள் அனைத்து கருவிகளையும் நியாயமான கவனத்துடன் கையாள வேண்டும்
- கருவியின் எந்த சேதமும் உடனடியாக தெரிவிக்கப்பட வேண்டும்
- சேதமடைந்த கருவியின் பழுதுபார்க்கும் செலவுகளுக்கு பயனர்கள் பொறுப்பு
- ஒப்புக்கொள்ளப்பட்ட தேதி மற்றும் நேரத்தில் கருவி திரும்பப் பெறப்பட வேண்டும்

**7. உரிமையாளர் பொறுப்புகள்**
- உரிமையாளர்கள் கருவி நல்ல வேலை நிலையில் இருப்பதை உறுதி செய்ய வேண்டும்
- துல்லியமான கருவி விளக்கங்கள் மற்றும் விலை நிர்ணயம் வழங்கப்பட வேண்டும்
- முன்பதிவு உறுதிப்படுத்தலின் படி கருவி கிடைக்கச் செய்யப்பட வேண்டும்

**8. தனியுரிமைக் கொள்கை**
- கருவி குத்தகையை வசதி படுத்த நாங்கள் தனிப்பட்ட தகவல்களை சேகரித்து பயன்படுத்துகிறோம்
- மொபைல் எண்கள் மற்றும் ஆதார் தகவல்கள் பாதுகாப்பாகவும் ரகசியமாகவும் வைக்கப்படுகின்றன
- அருகிலுள்ள கருவிகளுடன் பயனர்களை இணைக்க இடம் தொடர்பான தரவு பயன்படுத்தப்படலாம்

**9. பொறுப்பின் வரம்பு**
- கருவி சேதம், விபத்துகள் அல்லது காயங்களுக்கு ஹார்வ்டெக் பொறுப்பு அல்ல
- அனைத்து கருவி பயன்பாடும் பயனரின் சொந்த ஆபத்தில் உள்ளது
- அதிகபட்ச பொறுப்பு பரிவர்த்தனை தொகைக்கு வரையறுக்கப்பட்டுள்ளது

**10. சர்ச்சை தீர்வு**
- அனைத்து சர்ச்சைகளும் முதலில் மத்தியஸ்தம் மூலம் தீர்க்கப்படும்
- சட்ட சர்ச்சைகள் இந்திய அதிகார வரம்பின் கீழ் வரும்
- தமிழ்நாடு மாநில சட்டங்கள் அனைத்து ஒப்பந்தங்களுக்கும் பொருந்தும்

**11. முடிவு**
- கொள்கை மீறல்களுக்காக கணக்குகளை முடிவுக்கு கொண்டுவரும் உரிமையை ஹார்வ்டெக் கொண்டுள்ளது
- பயனர்கள் எந்த நேரத்திலும் தங்கள் கணக்குகளை நீக்கலாம்

**12. மாற்றங்கள்**
- இந்த விதிமுறைகள் அவ்வப்போது புதுப்பிக்கப்படலாம்
- தொடர்ந்து பயன்படுத்துவது மாற்றப்பட்ட விதிமுறைகளின் ஏற்றுக்கொள்ளலை குறிக்கிறது

இந்த விதிமுறைகளை ஏற்றுக்கொள்வதன் மூலம், மேலே குறிப்பிட்டுள்ள அனைத்து நிபந்தனைகளையும் நீங்கள் படித்து, புரிந்துகொண்டு, கட்டுப்படுவதை ஒப்புக்கொள்வதாக ஒப்புக்கொள்கிறீர்கள்.

கடைசியாக புதுப்பிக்கப்பட்டது: ஜனவரி 2024
      `
    }
  };

  const currentTerms = termsContent[currentLanguage];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{currentTerms.title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Please read and accept the terms and conditions to continue
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-96 pr-3">
          <div className="text-sm space-y-3 whitespace-pre-line">
            {currentTerms.content}
          </div>
        </ScrollArea>
        
        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button 
            onClick={onAccept}
            className="flex-1 bg-ag-green hover:bg-ag-green/90 text-white"
          >
            {t('accept') || 'Accept'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}