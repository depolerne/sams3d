'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import modelCache from '../utils/ModelCache';
import LazyModel3DPreview from '../components/LazyModel3DPreview';
import CacheLoadingIndicator from '../components/CacheLoadingIndicator';

interface MenuItem {
  id: string;
  name: string | { en: string; ru: string; az: string };
  description: string | { en: string; ru: string; az: string };
  price: string;
  category: string;
  imagePath?: string;
  modelPath: string;
  mtlPath: string;
}

interface MenuData {
  categories: {
    id: string;
    name: string | { en: string; ru: string; az: string };
    items: MenuItem[];
  }[];
}

export default function Home() {
  const { t, language } = useLanguage();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('salads');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetch('/menu-data.json')
      .then(res => res.json())
      .then(async (data: MenuData) => {
        setMenuData(data);
        setLoading(false);
        
        // Предзагружаем только первые 3 модели для быстрого старта
        const currentCategoryItems = data.categories.find(cat => cat.id === 'salads')?.items || [];
        const modelsToPreload = currentCategoryItems.slice(0, 3).map(item => ({
          modelPath: item.modelPath,
          mtlPath: item.mtlPath
        }));
        
        // Предзагружаем критически важные модели
        modelCache.preloadModels(modelsToPreload)
          .catch(error => {
            console.warn('Some models failed to preload:', error);
          });
        
        // Предзагружаем остальные модели категории в фоне с задержкой
        setTimeout(() => {
          const remainingModels = currentCategoryItems.slice(3, 8).map(item => ({
            modelPath: item.modelPath,
            mtlPath: item.mtlPath
          }));
          modelCache.preloadModels(remainingModels)
            .catch(error => console.warn('Background preload failed:', error));
        }, 2000);
        
        setModelsLoading(false);
      })
      .catch(err => {
        console.error('Error loading menu data:', err);
        setLoading(false);
        setModelsLoading(false);
      });
  }, []);

  // Проверка возможности скролла
  useEffect(() => {
    const checkScroll = () => {
      const container = document.getElementById('categories-scroll');
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
      }
    };

    // Проверяем после загрузки данных
    if (menuData) {
      setTimeout(checkScroll, 100);
    }

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [menuData]);

  // Обработка клавиатурной навигации
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const container = document.getElementById('categories-scroll');
      if (!container) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (canScrollLeft) {
            container.scrollBy({ left: -300, behavior: 'smooth' });
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (canScrollRight) {
            container.scrollBy({ left: 300, behavior: 'smooth' });
          }
          break;
        case 'Home':
          event.preventDefault();
          container.scrollTo({ left: 0, behavior: 'smooth' });
          break;
        case 'End':
          event.preventDefault();
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canScrollLeft, canScrollRight]);

  const categories = menuData ? 
    menuData.categories.map(cat => ({ 
      id: cat.id, 
      name: t(cat.id.toLowerCase()) || cat.name 
    })) : [];
  
  const filteredItems = menuData ? 
    (menuData.categories.find(cat => cat.id === selectedCategory)?.items || []) : [];

  // Предзагружаем все модели сразу после загрузки данных
  useEffect(() => {
    if (menuData) {
      console.log(`🚀 Starting global preload of all models`);
      
      // Собираем все модели из всех категорий
      const allModels: Array<{ modelPath: string; mtlPath?: string }> = [];
      
      menuData.categories.forEach(category => {
        category.items.forEach(item => {
          allModels.push({
            modelPath: item.modelPath,
            mtlPath: item.mtlPath
          });
        });
      });
      
      console.log(`📦 Found ${allModels.length} models to preload globally`);
      
      // Предзагружаем все модели в фоне
      modelCache.preloadModels(allModels)
        .then((results) => {
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          console.log(`🎉 Global preload completed: ${successful} models loaded, ${failed} failed`);
        })
        .catch(error => {
          console.error(`❌ Failed to preload models globally:`, error);
        });
    }
  }, [menuData]);
  
  // Быстрое переключение категорий без дополнительной загрузки
  useEffect(() => {
    if (menuData && selectedCategory) {
      console.log(`🔄 Switching to category: ${selectedCategory}`);
      setCategoryLoading(true);
      
      // Просто переключаем категорию, модели уже предзагружены
      setTimeout(() => {
        setCategoryLoading(false);
        console.log(`✅ Category ${selectedCategory} switched instantly`);
      }, 100); // Минимальная задержка для плавности UI
    }
  }, [selectedCategory, menuData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-xl">{t('loading_menu')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Overlay лоадер для 3D превью */}
      {modelsLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 text-xl mb-4">{t('loading_3d_previews')}</p>
            <div className="w-80 bg-gray-800 rounded-full h-3 mx-auto">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <p className="text-gray-400 text-sm mt-3">{t('preparing_3d_models')}</p>
          </div>
        </div>
      )}
      
      {/* Лоадер для смены категории */}
      {categoryLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-black/80 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/30">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/80 via-black to-purple-900/80 backdrop-blur-sm py-4 border-b border-cyan-500/20">
        <div className="container mx-auto px-4 flex w-full justify-center items-center">
        
          <LanguageSwitcher />
        </div>
      </header>



      {/* Category Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-10">
          {/* Контейнер с навигационными стрелками и категориями */}
          <div className="flex items-center gap-3">
            {/* Левая стрелка навигации */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: canScrollLeft ? 1 : 0.3, 
                scale: canScrollLeft ? 1 : 0.8 
              }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                const container = document.getElementById('categories-scroll');
                if (container) {
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                canScrollLeft 
                  ? 'bg-gradient-to-r from-cyan-500/80 to-purple-500/80 hover:from-cyan-400 hover:to-purple-400 text-white hover:shadow-lg hover:shadow-cyan-500/40 border border-cyan-400/50 cursor-pointer' 
                  : 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
              }`}
              title="Прокрутить влево"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Скроллируемый контейнер с категориями */}
            <div 
              id="categories-scroll"
              className="flex gap-3 overflow-x-auto scrollbar-hide flex-1" 
              style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setCanScrollLeft(target.scrollLeft > 0);
                setCanScrollRight(target.scrollLeft < target.scrollWidth - target.clientWidth);
              }}
            >
              {categories.map((category) => {
                const categoryKey = category.id.toLowerCase();
                const categoryName = typeof category.name === 'object' ? category.name[language] || category.name.en : t(categoryKey);
                
                return (
                  <button
                    key={category.id}
                    onClick={async () => {
                      if (category.id !== selectedCategory) {
                        setCategoryLoading(true);
                        
                        // Показываем лоадер перед сменой категории
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        setSelectedCategory(category.id);
                        
                        // Дополнительная задержка для плавности
                        setTimeout(() => {
                          setCategoryLoading(false);
                        }, 100);
                      }
                    }}
                    className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 border whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white  border-cyan-400/50 hover:shadow-cyan-500/60'
                        : 'bg-gray-900/60 backdrop-blur-sm text-gray-300 hover:bg-gray-800/80 hover:text-cyan-400 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">
                        {category.id === 'salads' ? '🥗' :
                         category.id === 'Pasta' ? '🍝' :
                         category.id === 'Noodles' ? '🍜' :
                         category.id === 'Pizza' ? '🍕' :
                         category.id === 'Toasts & Sandwiches' ? '🥪' :
                         category.id === 'Burgers' ? '🍔' :
                         category.id === 'Rolls' ? '🌯' :
                         category.id === 'Soups' ? '🍲' :
                         category.id === 'Snacks' ? '🍿' : '🍽️'}
                      </span>
                      <span>{categoryName}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Правая стрелка навигации */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: canScrollRight ? 1 : 0.3, 
                scale: canScrollRight ? 1 : 0.8 
              }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                const container = document.getElementById('categories-scroll');
                if (container) {
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                canScrollRight 
                  ? 'bg-gradient-to-r from-cyan-500/80 to-purple-500/80 hover:from-cyan-400 hover:to-purple-400 text-white hover:shadow-lg hover:shadow-cyan-500/40 border border-cyan-400/50 cursor-pointer' 
                  : 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
              }`}
              title="Прокрутить вправо"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Category Loading Indicator */}
        {categoryLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <p className="text-cyan-400 font-medium">Загрузка моделей категории...</p>
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${categoryLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/80 via-black to-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-400/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 group hover:scale-[1.02]"
            >
              {/* Preview Image or 3D Icon */}
              <div className="h-52 bg-gradient-to-br from-purple-600/80 via-cyan-600/80 to-purple-800/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* 3D Model Preview */}
                <div className="absolute inset-0">
                  <LazyModel3DPreview 
                    modelPath={item.modelPath}
                    mtlPath={item.mtlPath}
                    className="opacity-80 group-hover:opacity-100 transition-all duration-500"
                    priority={index < 4} // Приоритет для первых 4 элементов
                  />
                </div>
                
                {/* 3D Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500/90 to-purple-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                  3D
                </div>
                
                {/* Category badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-1">
                  {typeof item.name === 'object' ? item.name[language] || item.name.en : item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {typeof item.description === 'object' ? item.description[language] || item.description.en : item.description}
                </p>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {item.price}
                  </span>
                </div>
                
                {/* View 3D Button */}
                <Link href={`/view/${item.id}`}>
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/40 border border-cyan-500/20 hover:border-cyan-400/40 group/btn">
                    <span className="flex items-center justify-center gap-2">
                      <span>{t('view_in_3d')}</span>
                      <span className="text-lg group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">{t('no_items_found')}</p>
          </div>
        )}
      </div>
      
      {/* Cache Loading Indicator */}
      <CacheLoadingIndicator />
      

    </div>
  );
}