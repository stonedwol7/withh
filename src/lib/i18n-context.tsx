'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type LangCode = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ur' | 'ml'

const messages: Record<LangCode, Record<string, string>> = {
  en: {
    'app.name': 'WITHH',
    'app.tagline': 'When you can\'t go alone, we\'ll go with you.',
    'nav.home': 'Home',
    'nav.requests': 'Requests',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.assignments': 'Assignments',
    'nav.earnings': 'Earnings',
    'request.support': 'Request Support',
    'request.submit': 'Submit Request',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'sos.title': 'Emergency SOS',
    'sos.sent': 'SOS Sent — Help is on the way',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
  },
  kn: {
    'app.name': 'ವಿಥ್',
    'app.tagline': 'ನೀವು ಒಬ್ಬಂಟಿಯಾಗಿ ಹೋಗಲು ಸಾಧ್ಯವಾಗದಾಗ, ನಾವು ನಿಮ್ಮೊಂದಿಗೆ ಹೋಗುತ್ತೇವೆ.',
    'nav.home': 'ಮುಖಪುಟ',
    'nav.requests': 'ವಿನಂತಿಗಳು',
    'nav.messages': 'ಸಂದೇಶಗಳು',
    'nav.profile': 'ಪ್ರೊಫೈಲ್',
    'request.support': 'ಬೆಂಬಲ ವಿನಂತಿಸಿ',
    'common.save': 'ಉಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.confirm': 'ದೃಢೀಕರಿಸಿ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'auth.login': 'ಲಾಗಿನ್',
    'auth.register': 'ನೋಂದಣಿ',
    'auth.logout': 'ಲಾಗೌಟ್',
  },
  hi: {
    'app.name': 'विद',
    'app.tagline': 'जब आप अकेले नहीं जा सकते, हम आपके साथ चलेंगे।',
    'nav.home': 'होम',
    'nav.requests': 'अनुरोध',
    'nav.messages': 'संदेश',
    'nav.profile': 'प्रोफ़ाइल',
    'request.support': 'सहायता का अनुरोध करें',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.loading': 'लोड हो रहा है...',
    'auth.login': 'लॉग इन',
    'auth.register': 'पंजीकरण',
    'auth.logout': 'लॉग आउट',
  },
  ta: {
    'app.name': 'வித்',
    'nav.home': 'முகப்பு',
    'nav.requests': 'கோரிக்கைகள்',
    'nav.messages': 'செய்திகள்',
    'nav.profile': 'சுயவிவரம்',
    'request.support': 'ஆதரவு கோரவும்',
    'common.save': 'சேமி',
    'common.cancel': 'ரத்துசெய்',
    'common.confirm': 'உறுதிப்படுத்து',
    'auth.login': 'உள்நுழை',
    'auth.register': 'பதிவு செய்',
    'auth.logout': 'வெளியேறு',
  },
  te: {
    'app.name': 'విత్',
    'nav.home': 'హోమ్',
    'nav.requests': 'అభ్యర్థనలు',
    'nav.messages': 'సందేశాలు',
    'common.save': 'సేవ్',
    'common.cancel': 'రద్దు',
    'common.confirm': 'నిర్ధారించు',
    'auth.login': 'లాగిన్',
    'auth.register': 'నమోదు',
    'auth.logout': 'లాగ్అవుట్',
  },
  ur: {
    'app.name': 'وِد',
    'nav.home': 'ہوم',
    'nav.requests': 'درخواستیں',
    'nav.messages': 'پیغامات',
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ کریں',
    'common.confirm': 'تصدیق کریں',
    'auth.login': 'لاگ ان',
    'auth.register': 'رجسٹریشن',
    'auth.logout': 'لاگ آؤٹ',
  },
  ml: {
    'app.name': 'വിത്ത്',
    'nav.home': 'ഹോം',
    'nav.requests': 'അഭ്യർത്ഥനകൾ',
    'nav.messages': 'സന്ദേശങ്ങൾ',
    'common.save': 'സംരക്ഷിക്കുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.confirm': 'സ്ഥിരീകരിക്കുക',
    'auth.login': 'ലോഗിൻ',
    'auth.register': 'രജിസ്റ്റർ',
    'auth.logout': 'ലോഗൗട്ട്',
  },
}

interface I18nState {
  locale: LangCode
  setLocale: (l: LangCode) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nState | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LangCode>('en')

  const t = (key: string): string => {
    return messages[locale]?.[key] || messages['en']?.[key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export const langNames: Record<LangCode, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ur: 'اردو',
  ml: 'മലയാളം',
}

export type { LangCode }
