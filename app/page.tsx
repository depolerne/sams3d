'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  modelPath: string;
  mtlPath: string;
}

interface MenuData {
  categories: {
    id: string;
    name: string;
    items: MenuItem[];
  }[];
}

export default function Home() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/menu-data.json')
      .then(res => res.json())
      .then((data: MenuData) => {
        setMenuData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading menu data:', err);
        setLoading(false);
      });
  }, []);

  const categories = menuData ? menuData.categories.map(cat => ({ id: cat.id, name: cat.name })) : [];
  const filteredItems = menuData ? 
    (selectedCategory === 'all' 
      ? menuData.categories.find(cat => cat.id === 'all')?.items || []
      : menuData.categories.find(cat => cat.id === selectedCategory)?.items || []
    ) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-xl">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/80 via-black to-purple-900/80 backdrop-blur-sm pb-2 pt-8 border-b border-cyan-500/20">
        <div className="container mx-auto px-4 text-center">
          {/* <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
            
              <h1 className="text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  Sam's Club
                </span>
              </h1>
              
            </div>
          </div> */}
          
        </div>
      </header>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-10">
          {/* Градиентные маски для скролла */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
          
          {/* Скроллируемый контейнер */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 border whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white  border-cyan-400/50 hover:shadow-cyan-500/60'
                    : 'bg-gray-900/60 backdrop-blur-sm text-gray-300 hover:bg-gray-800/80 hover:text-cyan-400 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {category.id === 'all' ? '🍽️' :
                     category.id === 'drinks' ? '🍸' :
                     category.id === 'salads' ? '🥗' :
                     category.id === 'food' ? '🍽️' :
                     category.id === 'desserts' ? '🍰' : '🍴'}
                  </span>
                  <span>{category.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/80 via-black to-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-400/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 group hover:scale-[1.02]"
            >
              {/* Preview Image Placeholder with 3D effect */}
              <div className="h-52 bg-gradient-to-br from-purple-600/80 via-cyan-600/80 to-purple-800/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* 3D Icon with glow effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl opacity-60 group-hover:opacity-90 transition-all duration-500 transform group-hover:scale-110 filter drop-shadow-lg">
                    {item.category === 'drinks' ? '🍸' : 
                     item.category === 'salads' ? '🥗' :
                     item.category === 'food' ? '🍽️' : 
                     item.category === 'desserts' ? '🍰' : '🍴'}
                  </div>
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
                  {item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                
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
                      <span>View in 3D</span>
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
            <p className="text-gray-400 text-xl">Блюда в данной категории не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}