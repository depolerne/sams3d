'use client';

import { motion } from 'framer-motion';
import { useLanguage, Language } from '../contexts/LanguageContext';

const languages = [
  { code: 'en' as Language, name: 'EN', flag: '🇺🇸' },
  { code: 'ru' as Language, name: 'RU', flag: '🇷🇺' },
  { code: 'az' as Language, name: 'AZ', flag: '🇦🇿' }
];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            language === lang.code
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm">{lang.flag}</span>
          <span className="text-sm font-semibold">{lang.name}</span>
        </motion.button>
      ))}
    </div>
  );
}