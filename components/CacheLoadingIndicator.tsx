'use client';

import { useModelCache } from '../hooks/useModelCache';

interface CacheLoadingIndicatorProps {
  className?: string;
}

export default function CacheLoadingIndicator({ className = '' }: CacheLoadingIndicatorProps) {
  const { cacheInfo, isLoading } = useModelCache();
  
  const totalLoading = cacheInfo.loadingPromises + cacheInfo.materialPromises;
  
  if (!isLoading && totalLoading === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-black/60 backdrop-blur-sm p-2 rounded-full border border-cyan-500/20 shadow-lg">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}