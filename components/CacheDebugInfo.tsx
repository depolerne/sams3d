'use client';

import { useState } from 'react';
import { useModelCache } from '../hooks/useModelCache';

interface CacheDebugInfoProps {
  show?: boolean;
}

export default function CacheDebugInfo({ show = false }: CacheDebugInfoProps) {
  const { cacheInfo, clearCache, isLoading } = useModelCache();
  const [isVisible, setIsVisible] = useState(show);

  if (!isVisible && !show) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800/80 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-700/80 transition-colors z-50"
        title="Показать информацию о кеше"
      >
        📊 Cache
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg border border-gray-700 z-50 min-w-[250px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-cyan-400">Model Cache Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Скрыть"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-300">Cached Models:</span>
          <span className="text-green-400 font-mono">{cacheInfo.modelCacheSize}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Cached Materials:</span>
          <span className="text-blue-400 font-mono">{cacheInfo.materialCacheSize}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Loading Models:</span>
          <span className="text-yellow-400 font-mono">{cacheInfo.loadingPromises}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Loading Materials:</span>
          <span className="text-orange-400 font-mono">{cacheInfo.materialPromises}</span>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-400">
            <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-700">
        <button
          onClick={clearCache}
          className="w-full bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded text-xs transition-colors"
          title="Очистить весь кеш"
        >
          🗑️ Clear Cache
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Cache auto-cleans after 30min
      </div>
    </div>
  );
}