'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import modelCache from '../utils/ModelCache';

interface Model3DPreviewProps {
  modelPath: string;
  mtlPath: string;
  className?: string;
}

export default function Model3DPreview({ modelPath, mtlPath, className = '' }: Model3DPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Создаем сцену
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      65,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    // Устанавливаем камеру близко и наклоняем вниз (отдалено на 30%)
    camera.position.set(0, 5.6, 0.6);
    camera.lookAt(0, -0.2, 0);

    // Создаем рендерер с оптимизациями для мобильных устройств
    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile, // Отключаем антиалиасинг на мобильных
      alpha: true,
      preserveDrawingBuffer: false, // Экономим память
      powerPreference: 'low-power' // Энергосбережение
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Прозрачный фон
    renderer.shadowMap.enabled = !isMobile; // Отключаем тени на мобильных
    if (!isMobile) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)); // Ограничиваем разрешение
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Оптимизированное освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 2.0 : 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 1.5 : 2.0);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = !isMobile; // Отключаем тени на мобильных
    scene.add(directionalLight);

    // Добавляем дополнительные источники только на десктопе
    if (!isMobile) {
      const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
      pointLight.position.set(-5, 5, 5);
      scene.add(pointLight);

      const additionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      additionalLight.position.set(0, 10, 0);
      scene.add(additionalLight);
    }

    // Функция для загрузки и настройки модели
    const loadAndSetupModel = (object: THREE.Object3D) => {
      // Центрируем модель
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      
      // Масштабируем модель для максимального приближения
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.5 / maxDim; // Увеличиваем масштаб для большего приближения
      object.scale.setScalar(scale);
      
      modelRef.current = object;
      scene.add(object);
    };

    // Загружаем модель через кеш
    if (!modelPath) {
      console.error('Model path is required');
      return;
    }

    // Используем кеш для загрузки модели
    modelCache.loadModel(modelPath, mtlPath)
      .then(loadAndSetupModel)
      .catch((error) => {
        console.error('Error loading model from cache:', error);
      });

    // Оптимизированная анимация с адаптивным FPS
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60; // Снижаем FPS на мобильных
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        if (modelRef.current) {
          modelRef.current.rotation.y += isMobile ? 0.008 : 0.01; // Медленнее на мобильных
        }
        
        renderer.render(scene, camera);
        lastTime = currentTime;
      }
      
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate(0);

    // Обработка изменения размера
    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      
      // Очищаем сцену
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [modelPath, mtlPath]);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}