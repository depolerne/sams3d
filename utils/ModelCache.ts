'use client';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

interface CachedModel {
  object: THREE.Object3D;
  materials?: any;
  timestamp: number;
}

interface CachedMaterial {
  materials: any;
  timestamp: number;
}

class ModelCacheManager {
  private modelCache = new Map<string, CachedModel>();
  private materialCache = new Map<string, CachedMaterial>();
  private loadingPromises = new Map<string, Promise<THREE.Object3D>>();
  private materialPromises = new Map<string, Promise<any>>();
  private readonly maxCacheSize = 50; // Максимальное количество моделей в кеше
  private readonly maxAge = 30 * 60 * 1000; // 30 минут в миллисекундах

  // Генерация ключа для кеша
  private getModelKey(modelPath: string, mtlPath?: string): string {
    return `${modelPath}${mtlPath ? `|${mtlPath}` : ''}`;
  }

  // Очистка старых записей из кеша
  private cleanupCache() {
    const now = Date.now();
    
    // Очистка кеша моделей
    Array.from(this.modelCache.entries()).forEach(([key, cached]) => {
      if (now - cached.timestamp > this.maxAge) {
        this.disposeModel(cached.object);
        this.modelCache.delete(key);
      }
    });
    
    // Очистка кеша материалов
    Array.from(this.materialCache.entries()).forEach(([key, cached]) => {
      if (now - cached.timestamp > this.maxAge) {
        this.materialCache.delete(key);
      }
    });
    
    // Если кеш все еще слишком большой, удаляем самые старые записи
    if (this.modelCache.size > this.maxCacheSize) {
      const sortedEntries = Array.from(this.modelCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.modelCache.size - this.maxCacheSize);
      for (const [key, cached] of toRemove) {
        this.disposeModel(cached.object);
        this.modelCache.delete(key);
      }
    }
  }

  // Правильная очистка ресурсов модели
  private disposeModel(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => {
              if (material.map) material.map.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.aoMap) material.aoMap.dispose();
              material.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            if (child.material.normalMap) child.material.normalMap.dispose();
            if (child.material.aoMap) child.material.aoMap.dispose();
            child.material.dispose();
          }
        }
      }
    });
  }

  // Загрузка материалов с кешированием
  async loadMaterials(mtlPath: string): Promise<any> {
    // Проверяем кеш
    const cached = this.materialCache.get(mtlPath);
    if (cached) {
      return cached.materials;
    }

    // Проверяем, не загружается ли уже
    const existingPromise = this.materialPromises.get(mtlPath);
    if (existingPromise) {
      return existingPromise;
    }

    // Создаем новый промис загрузки
    const loadPromise = new Promise<any>((resolve, reject) => {
      const mtlLoader = new MTLLoader();
      const basePath = mtlPath.substring(0, mtlPath.lastIndexOf('/') + 1);
      const mtlFileName = mtlPath.substring(mtlPath.lastIndexOf('/') + 1);
      mtlLoader.setPath(basePath);
      
      mtlLoader.load(
        mtlFileName,
        (materials) => {
          materials.preload();
          
          // Сохраняем в кеш
          this.materialCache.set(mtlPath, {
            materials,
            timestamp: Date.now()
          });
          
          this.materialPromises.delete(mtlPath);
          resolve(materials);
        },
        undefined,
        (error) => {
          this.materialPromises.delete(mtlPath);
          reject(error);
        }
      );
    });

    this.materialPromises.set(mtlPath, loadPromise);
    return loadPromise;
  }

  // Загрузка модели с кешированием
  async loadModel(modelPath: string, mtlPath?: string): Promise<THREE.Object3D> {
    const cacheKey = this.getModelKey(modelPath, mtlPath);
    
    // Проверяем кеш
    const cached = this.modelCache.get(cacheKey);
    if (cached) {
      // Клонируем объект для безопасного использования
      return cached.object.clone();
    }

    // Проверяем, не загружается ли уже
    const existingPromise = this.loadingPromises.get(cacheKey);
    if (existingPromise) {
      const object = await existingPromise;
      return object.clone();
    }

    // Создаем новый промис загрузки
    const loadPromise = new Promise<THREE.Object3D>(async (resolve, reject) => {
      try {
        const objLoader = new OBJLoader();
        let materials: any;

        // Загружаем материалы если указан путь
        if (mtlPath) {
          try {
            materials = await this.loadMaterials(mtlPath);
            objLoader.setMaterials(materials);
          } catch (error) {
            console.warn('Failed to load materials, loading model without them:', error);
          }
        }

        // Загружаем модель
        objLoader.load(
          modelPath,
          (object) => {
            // Если материалы не загрузились, применяем базовый материал
            if (!materials) {
              object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.material = new THREE.MeshLambertMaterial({ color: 0x888888 });
                }
              });
            }

            // Сохраняем в кеш
            this.modelCache.set(cacheKey, {
              object: object.clone(), // Сохраняем клон для кеша
              materials,
              timestamp: Date.now()
            });

            this.loadingPromises.delete(cacheKey);
            this.cleanupCache(); // Очищаем старые записи
            resolve(object);
          },
          undefined,
          (error) => {
            this.loadingPromises.delete(cacheKey);
            reject(error);
          }
        );
      } catch (error) {
        this.loadingPromises.delete(cacheKey);
        reject(error);
      }
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  // Предзагрузка моделей
  async preloadModels(models: Array<{ modelPath: string; mtlPath?: string }>) {
    const promises = models.map(({ modelPath, mtlPath }) => 
      this.loadModel(modelPath, mtlPath).catch(error => {
        console.warn(`Failed to preload model ${modelPath}:`, error);
        return null;
      })
    );
    
    await Promise.allSettled(promises);
  }

  // Получение информации о кеше
  getCacheInfo() {
    return {
      modelCacheSize: this.modelCache.size,
      materialCacheSize: this.materialCache.size,
      loadingPromises: this.loadingPromises.size,
      materialPromises: this.materialPromises.size
    };
  }

  // Очистка всего кеша
  clearCache() {
    // Очищаем ресурсы моделей
    Array.from(this.modelCache.values()).forEach(cached => {
      this.disposeModel(cached.object);
    });
    
    this.modelCache.clear();
    this.materialCache.clear();
    this.loadingPromises.clear();
    this.materialPromises.clear();
  }

  // Проверка наличия модели в кеше
  hasModel(modelPath: string, mtlPath?: string): boolean {
    const cacheKey = `${modelPath}${mtlPath ? `|${mtlPath}` : ''}`;
    return this.modelCache.has(cacheKey);
  }
}

// Экспортируем синглтон
export const modelCache = new ModelCacheManager();
export default modelCache;