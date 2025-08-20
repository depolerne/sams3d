'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import modelCache from '../utils/ModelCache'

interface Model3DProps {
  modelPath: string
  texturePath?: string
  mtlPath?: string
  scale?: number
}

interface TexturePaths {
  diffuse?: string    // Основная цветная текстура
  normal?: string     // Карта нормалей
  roughness?: string  // Карта шероховатости
  detail?: string     // Детальная текстура
}

function Model3D({ modelPath, texturePath, mtlPath, scale = 1 }: Model3DProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [obj, setObj] = useState<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    setObj(null)
    
    console.log(`🔄 Model3D: Starting to load ${modelPath}`);
    
    // Проверяем, есть ли модель в кеше
    if (modelCache.hasModel(modelPath, mtlPath)) {
      console.log(`💾 Model3D: Found in cache ${modelPath}`);
    } else {
      console.log(`📥 Model3D: Not in cache, will load ${modelPath}`);
    }
    
    // Используем кеш для загрузки модели
    modelCache.loadModel(modelPath, mtlPath)
      .then((loadedModel) => {
        console.log(`✅ Model3D: Successfully loaded ${modelPath}`);
        if (loadedModel instanceof THREE.Group) {
          setObj(loadedModel)
        } else {
          console.warn('Loaded model is not a Group:', loadedModel)
          setObj(null)
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(`❌ Model3D: Error loading model ${modelPath}:`, error)
        setLoadError(error.message || 'Failed to load model')
        setObj(null)
        setIsLoading(false)
      })
  }, [modelPath, mtlPath])
  
  // Fallback для старых текстур (если нет MTL)
  const diffuseTexture = texturePath && !mtlPath ? useLoader(TextureLoader, texturePath) : null
  
  useEffect(() => {
    if (obj && !mtlPath && diffuseTexture) {
      // Применяем текстуру только если нет MTL файла
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: diffuseTexture,
            metalness: 0.2,
            roughness: 0.6
          })
        }
      })
    }
  }, [obj, diffuseTexture, mtlPath])
  
  // Плавная анимация вращения (только после загрузки модели)
  useFrame((state) => {
    if (meshRef.current && obj && !isLoading) {
      meshRef.current.rotation.y += hovered ? 0.01 : 0.003
      // Убираем вертикальное покачивание для более стабильного вида
    }
  })
  
  // Показываем индикатор загрузки или ошибку
  if (isLoading) {
    return (
      <Html center>
        <div className="flex flex-col items-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <div className="text-sm">Загрузка модели...</div>
        </div>
      </Html>
    )
  }
  
  if (loadError) {
    return (
      <Html center>
        <div className="flex flex-col items-center text-red-400">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm text-center max-w-48">
            Ошибка загрузки модели: {loadError}
          </div>
        </div>
      </Html>
    )
  }
  
  if (!obj) {
    return (
      <Html center>
        <div className="flex flex-col items-center text-gray-400">
          <div className="text-2xl mb-2">📦</div>
          <div className="text-sm">Модель не найдена</div>
        </div>
      </Html>
    )
  }

  return (
    <group
      ref={meshRef}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={obj} />
    </group>
  )
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Html>
  )
}

interface Model3DViewerProps {
  modelPath: string
  texturePath?: string
  mtlPath?: string
  className?: string
  enableEffects?: boolean
}

export default function Model3DViewer({ modelPath, texturePath, mtlPath, className = '', enableEffects = true }: Model3DViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [1, 2, 0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {/* Освещение (предельная яркость) */}
          <ambientLight intensity={enableEffects ? 1.5 : 1.5} color="#ffffff" />
          {enableEffects ? (
            <>
              <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={2.0}
                castShadow
                color="#ffffff"
              />
              <spotLight
                position={[-10, -10, -10]}
                angle={0.15}
                penumbra={1}
                intensity={1.0}
                color="#ffffff"
              />
              <directionalLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />
            </>
          ) : (
            <>
              <directionalLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" />
              <directionalLight position={[-5, -5, -5]} intensity={1.0} color="#ffffff" />
              <directionalLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />
            </>
          )}
          
          {/* 3D Модель */}
          <Model3D modelPath={modelPath} texturePath={texturePath} mtlPath={mtlPath} />
          
          {/* Тени - только если эффекты включены */}
          {enableEffects && (
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
          )}
          
          {/* Окружение */}
          <Environment preset={enableEffects ? "night" : "studio"} />
          
          {/* Управление камерой */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={8}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI - Math.PI / 8}
            target={[0, 0, 0]}
            autoRotate={false}
            autoRotateSpeed={0.5}
            dampingFactor={0.1}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}