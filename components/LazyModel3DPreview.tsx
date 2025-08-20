'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Model3DPreview = dynamic(() => import('./Model3DPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

interface LazyModel3DPreviewProps {
  modelPath: string;
  mtlPath: string;
  className?: string;
  priority?: boolean; // Для приоритетной загрузки
}

export default function LazyModel3DPreview({ 
  modelPath, 
  mtlPath, 
  className = '',
  priority = false 
}: LazyModel3DPreviewProps) {
  const [isVisible, setIsVisible] = useState(priority); // Если priority=true, загружаем сразу
  const [shouldLoad, setShouldLoad] = useState(priority);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // Приоритетные элементы загружаются сразу

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Добавляем небольшую задержку для плавности
            setTimeout(() => setShouldLoad(true), 100);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до появления
        threshold: 0.1
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [priority]);

  return (
    <div ref={elementRef} className={`w-full h-full ${className}`}>
      {shouldLoad ? (
        <Model3DPreview 
          modelPath={modelPath}
          mtlPath={mtlPath}
          className={className}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          {isVisible ? (
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="text-gray-500 text-sm flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <span>3D модель</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}