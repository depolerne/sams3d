'use client';

import { useEffect, useState } from 'react';
import modelCache from '../utils/ModelCache';

interface ModelCacheInfo {
  modelCacheSize: number;
  materialCacheSize: number;
  loadingPromises: number;
  materialPromises: number;
}

interface UseModelCacheReturn {
  cacheInfo: ModelCacheInfo;
  preloadModel: (modelPath: string, mtlPath?: string) => Promise<void>;
  preloadModels: (models: Array<{ modelPath: string; mtlPath?: string }>) => Promise<void>;
  hasModel: (modelPath: string, mtlPath?: string) => boolean;
  clearCache: () => void;
  isLoading: boolean;
}

export function useModelCache(): UseModelCacheReturn {
  const [cacheInfo, setCacheInfo] = useState<ModelCacheInfo>({
    modelCacheSize: 0,
    materialCacheSize: 0,
    loadingPromises: 0,
    materialPromises: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем информацию о кеше
  const updateCacheInfo = () => {
    setCacheInfo(modelCache.getCacheInfo());
  };

  // Предзагрузка одной модели
  const preloadModel = async (modelPath: string, mtlPath?: string): Promise<void> => {
    setIsLoading(true);
    try {
      await modelCache.loadModel(modelPath, mtlPath);
    } catch (error) {
      console.warn(`Failed to preload model ${modelPath}:`, error);
    } finally {
      setIsLoading(false);
      updateCacheInfo();
    }
  };

  // Предзагрузка нескольких моделей
  const preloadModels = async (models: Array<{ modelPath: string; mtlPath?: string }>): Promise<void> => {
    setIsLoading(true);
    try {
      await modelCache.preloadModels(models);
    } catch (error) {
      console.warn('Failed to preload some models:', error);
    } finally {
      setIsLoading(false);
      updateCacheInfo();
    }
  };

  // Проверка наличия модели в кеше
  const hasModel = (modelPath: string, mtlPath?: string): boolean => {
    return modelCache.hasModel(modelPath, mtlPath);
  };

  // Очистка кеша
  const clearCache = (): void => {
    modelCache.clearCache();
    updateCacheInfo();
  };

  // Обновляем информацию о кеше при монтировании
  useEffect(() => {
    updateCacheInfo();
    
    // Периодически обновляем информацию о кеше
    const interval = setInterval(updateCacheInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    cacheInfo,
    preloadModel,
    preloadModels,
    hasModel,
    clearCache,
    isLoading
  };
}

export default useModelCache;