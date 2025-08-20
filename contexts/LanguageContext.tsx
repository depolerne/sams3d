'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'az';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Header
  '3d_club_menu': {
    en: '3D Club Menu',
    ru: '3D Меню Клуба',
    az: '3D Klub Menyusu'
  },
  'interactive_3d_menu': {
    en: 'Interactive 3D menu for club with stunning visual effects',
    ru: 'Интерактивное 3D меню для клуба с потрясающими визуальными эффектами',
    az: 'Heyrətamiz vizual effektlərlə klub üçün interaktiv 3D menyu'
  },
  
  // Loading states
  'loading_menu': {
    en: 'Loading menu...',
    ru: 'Загрузка меню...',
    az: 'Menyu yüklənir...'
  },
  'loading_3d_previews': {
    en: 'Loading 3D previews...',
    ru: 'Загрузка 3D превью...',
    az: '3D önizləmələr yüklənir...'
  },
  'preparing_3d_models': {
    en: 'Preparing 3D models...',
    ru: 'Подготовка 3D моделей...',
    az: '3D modellər hazırlanır...'
  },
  'loading_model': {
    en: 'Loading model...',
    ru: 'Загрузка модели...',
    az: 'Model yüklənir...'
  },
  
  // Categories
  'all_categories': {
    en: 'All Categories',
    ru: 'Все категории',
    az: 'Bütün kateqoriyalar'
  },
  'salads': {
    en: 'Salads',
    ru: 'Салаты',
    az: 'Salatlar'
  },
  'pasta': {
    en: 'Pasta',
    ru: 'Паста',
    az: 'Pasta'
  },
  'noodles': {
    en: 'Noodles',
    ru: 'Лапша',
    az: 'Əriştə'
  },
  'pizza': {
    en: 'Pizza',
    ru: 'Пицца',
    az: 'Pizza'
  },
  'toasts': {
     en: 'Toasts & Sandwiches',
     ru: 'Тосты и сэндвичи',
     az: 'Tostlar və sendviçlər'
   },
  'burgers': {
    en: 'Burgers',
    ru: 'Бургеры',
    az: 'Burgerlər'
  },
  'rolls': {
    en: 'Rolls',
    ru: 'Роллы',
    az: 'Rulonlar'
  },
  'soups': {
    en: 'Soups',
    ru: 'Супы',
    az: 'Şorbalar'
  },
  'snacks': {
    en: 'Snacks',
    ru: 'Закуски',
    az: 'Qəlyanaltılar'
  },
  'other': {
    en: 'Other',
    ru: 'Другое',
    az: 'Digər'
  },
  'drinks': {
    en: 'Drinks',
    ru: 'Напитки',
    az: 'İçkilər'
  },
  
  // Navigation
  'back_to_menu': {
    en: 'Back to menu',
    ru: 'Назад к меню',
    az: 'Menyuya qayıt'
  },
  'view_details': {
    en: 'View Details',
    ru: 'Подробнее',
    az: 'Ətraflı bax'
  },
  
  // Error messages
  'dish_not_found': {
    en: 'Dish not found',
    ru: 'Блюдо не найдено',
    az: 'Yemək tapılmadı'
  },
  'no_dishes_found': {
    en: 'No dishes found in this category',
    ru: 'В этой категории блюд не найдено',
    az: 'Bu kateqoriyada yemək tapılmadı'
  },
  
  // Language names
  'english': {
    en: 'English',
    ru: 'Английский',
    az: 'İngiliscə'
  },
  'russian': {
    en: 'Russian',
    ru: 'Русский',
    az: 'Rusca'
  },
  'azerbaijani': {
    en: 'Azerbaijani',
    ru: 'Азербайджанский',
    az: 'Azərbaycanca'
  },
  
  // Restaurant name
  'restaurant_name': {
    en: "Sam's 3D Menu",
    ru: '3D Меню Сэма',
    az: 'Səmin 3D Menyusu'
  },
  
  // Actions
  'view_in_3d': {
    en: 'View in 3D',
    ru: 'Смотреть в 3D',
    az: '3D-də bax'
  },
  
  // Messages
  'no_items_found': {
    en: 'No dishes found in this category',
    ru: 'Блюда в данной категории не найдены',
    az: 'Bu kateqoriyada yemək tapılmadı'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ru', 'az'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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

export { translations, type Language };