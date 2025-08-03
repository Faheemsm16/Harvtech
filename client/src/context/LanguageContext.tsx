import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'english' | 'tamil';

interface LanguageContextType {
  currentLanguage: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  english: {
    company_name: 'HARVTECH',
    tagline: 'Empowering Farmers, Connecting Markets',
    login: 'Login',
    register: 'Register',
    help: 'Help',
    welcome_back: 'Welcome Back!',
    mobile_number: 'Mobile Number',
    send_otp: 'Send OTP',
    enter_otp: 'Enter OTP',
    verify_otp: 'Verify OTP',
    select_role: 'Select Your Role',
    role_question: 'Are you an Owner or a User?',
    role_description: 'Choose your role to continue with registration',
    owner: 'Owner',
    user: 'User',
    owner_desc: 'I own agricultural equipment',
    user_desc: 'I want to lease equipment',
    user_registration: 'User Registration',
    owner_registration: 'Owner Registration',
    full_name: 'Full Name',
    city: 'City',
    country: 'Country',
    aadhaar_number: 'Aadhaar Number',
    terms_agreement: 'I agree to the Terms and Conditions and Privacy Policy',
    select_equipment: 'Select Your Equipment',
    tractor: 'Tractor',
    weeder: 'Weeder',
    tiller: 'Tiller',
    model_number: 'Model Number',
    chassis_vin: 'Chassis No. / VIN',
    continue: 'Continue',
    welcome: 'Welcome,',
    farmer_id: 'Farmer ID',
    machine_lease: 'Machine Lease',
    platforms: 'Platforms',
    services: 'Services',
    power: 'Power',
    location: 'Location',
    availability: 'Availability',
    per_day: 'per day',
    select: 'Select',
    payment: 'Payment',
    order_summary: 'Order Summary',
    equipment: 'Equipment',
    duration: 'Duration',
    rental_cost: 'Rental Cost',
    security_deposit: 'Security Deposit',
    total: 'Total',
    scan_qr: 'Scan QR Code to Pay',
    payment_instruction: 'Use any UPI app to scan and pay',
    confirm_payment: 'Confirm Payment',
    success: 'Success!',
    your_farmer_id: 'Your Farmer ID',
    ok: 'OK',
    model: 'Model',
    year: 'Year',
    chassis_no: 'Chassis No',
    status: 'Status',
    platform: 'Platform',
    cancel: 'Cancel',
    accept: 'Accept',
    view_terms: 'View Terms & Conditions',
    terms_and_conditions: 'Terms and Conditions',
    otp_verification: 'OTP Verification',
    otp_sent_to: 'OTP sent to your mobile number',
    resend_otp: 'Resend OTP',
  },
  tamil: {
    company_name: 'ஹார்வ்டெக்',
    tagline: 'விவசாயிகளை வலுப்படுத்துதல், சந்தைகளை இணைத்தல்',
    login: 'உள்நுழைவு',
    register: 'பதிவு செய்யவும்',
    help: 'உதவி',
    welcome_back: 'மீண்டும் வரவேற்கிறோம்!',
    mobile_number: 'கைபேசி எண்',
    send_otp: 'OTP அனுப்பவும்',
    enter_otp: 'OTP உள்ளிடவும்',
    verify_otp: 'OTP சரிபார்க்கவும்',
    select_role: 'உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
    role_question: 'நீங்கள் உரிமையாளரா அல்லது பயனரா?',
    role_description: 'பதிவுசெய்ய தொடர உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
    owner: 'உரிமையாளர்',
    user: 'பயனர்',
    owner_desc: 'என்னிடம் விவசாய கருவிகள் உள்ளன',
    user_desc: 'நான் கருவிகளை குத்தகைக்கு எடுக்க விரும்புகிறேன்',
    user_registration: 'பயனர் பதிவு',
    owner_registration: 'உரிமையாளர் பதிவு',
    full_name: 'முழு பெயர்',
    city: 'நகரம்',
    country: 'நாடு',
    aadhaar_number: 'ஆதார் எண்',
    terms_agreement: 'நிபந்தனைகள் மற்றும் தனியுரிமைக் கொள்கையை ஒப்புக்கொள்கிறேன்',
    select_equipment: 'உங்கள் கருவியைத் தேர்ந்தெடுக்கவும்',
    tractor: 'டிராக்டர்',
    weeder: 'களை நீக்கி',
    tiller: 'உழவர்',
    model_number: 'மாடல் எண்',
    chassis_vin: 'சேஸிஸ் எண் / VIN',
    continue: 'தொடரவும்',
    welcome: 'வரவேற்கிறோம்,',
    farmer_id: 'விவசாயி ID',
    machine_lease: 'இயந்திர குத்தகை',
    platforms: 'தளங்கள்',
    services: 'சேவைகள்',
    power: 'சக்தி',
    location: 'இடம்',
    availability: 'கிடைக்கும் தன்மை',
    per_day: 'ஒரு நாளைக்கு',
    select: 'தேர்ந்தெடுக்கவும்',
    payment: 'கட்டணம்',
    order_summary: 'ஆர்டர் சுருக்கம்',
    equipment: 'கருவி',
    duration: 'காலம்',
    rental_cost: 'வாடகை செலவு',
    security_deposit: 'பாதுகாப்பு வைப்பு',
    total: 'மொத்தம்',
    scan_qr: 'கட்டணம் செலுத்த QR குறியீட்டை ஸ்கேன் செய்யவும்',
    payment_instruction: 'ஸ்கேன் செய்து கட்டணம் செலுத்த எந்த UPI ஆப்பையும் பயன்படுத்தவும்',
    confirm_payment: 'கட்டணத்தை உறுதிப்படுத்தவும்',
    success: 'வெற்றி!',
    your_farmer_id: 'உங்கள் விவசாயி ID',
    ok: 'சரி',
    model: 'மாடல்',
    year: 'ஆண்டு',
    chassis_no: 'சேஸிஸ் எண்',
    status: 'நிலை',
    platform: 'தளம்',
    cancel: 'ரத்து செய்',
    accept: 'ஏற்க',
    view_terms: 'விதிமுறைகள் மற்றும் நிபந்தனைகளைப் பார்க்கவும்',
    terms_and_conditions: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    otp_verification: 'OTP சரிபார்ப்பு',
    otp_sent_to: 'உங்கள் மொபைல் எண்ணுக்கு OTP அனுப்பப்பட்டது',
    resend_otp: 'OTP மீண்டும் அனுப்பவும்',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'english' ? 'tamil' : 'english');
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations.english] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
