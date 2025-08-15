'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const Model3DViewer = dynamic(() => import('../../../components/Model3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  modelPath: string;
  texturePath?: string;
  mtlPath?: string;
}

interface MenuData {
  categories: {
    id: string;
    name: string;
    items: MenuItem[];
  }[];
}

export default function ViewPage() {
  const params = useParams();
  const router = useRouter();
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/menu-data.json')
      .then(res => res.json())
      .then((data: MenuData) => {
        const allItems = data.categories.flatMap(category => category.items);
        const item = allItems.find(item => item.id === params.id);
        setCurrentItem(item || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading menu data:', err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-xl">Loading model...</p>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Блюдо не найдено</p>
          <Link href="/">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors duration-300">
              Вернуться к меню
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-cyan-500/30 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-105">
              <ArrowLeft size={20} />
              Back to menu
            </button>
          </Link>
        
          <div className="w-24"></div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* 3D Viewer - увеличенный */}
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
          <Model3DViewer
            modelPath={currentItem.modelPath}
            texturePath={currentItem.texturePath}
            mtlPath={currentItem.mtlPath}
            className="w-full h-full"
            enableEffects={true}
          />
          
          {/* Floating controls hint */}
          {/* <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4 text-xs text-gray-300 border border-cyan-500/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">🖱️</span>
                <span>Поворот: ЛКМ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">🔍</span>
                <span>Масштаб: Колесо</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">✋</span>
                <span>Перемещение: ПКМ</span>
              </div>
            </div>
          </div> */}
        </div>

        {/* Item Details - компактная нижняя панель */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-cyan-500/30 p-6">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Левая часть - информация о блюде */}
              <div className="flex-1 flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 rounded-full text-xl font-medium backdrop-blur-sm">
                    {currentItem.category.charAt(0).toUpperCase() + currentItem.category.slice(1)}
                  </span>
                  {/* <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {currentItem.name}
                  </h2> */}
                </div>
                
                <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
                
                <div className="text-center lg:text-left">
                  <p className="text-gray-300 text-sm lg:text-base mb-3 max-w-md">{currentItem.description}</p>
                  <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {currentItem.price}
                  </span>
                </div>
              </div>
              
              {/* Правая часть - кнопка действия */}
              {/* <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/20">
                    ← Назад к меню
                  </button>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}