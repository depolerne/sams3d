'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { TextureLoader } from 'three'
import * as THREE from 'three'

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
  
  useEffect(() => {
    if (mtlPath) {
      // Загружаем MTL файл, затем OBJ
      const mtlLoader = new MTLLoader()
      const objLoader = new OBJLoader()
      
      // Устанавливаем базовый путь для правильного разрешения текстур
      const basePath = mtlPath.substring(0, mtlPath.lastIndexOf('/') + 1)
      const mtlFileName = mtlPath.substring(mtlPath.lastIndexOf('/') + 1)
      mtlLoader.setPath(basePath)
      
      mtlLoader.load(
        mtlFileName,
        (materials) => {
          materials.preload()
          objLoader.setMaterials(materials)
          
          objLoader.load(
            modelPath,
            (object) => {
              setObj(object)
            },
            undefined,
            (error) => {
              console.error('Error loading OBJ:', error)
              // Fallback: загружаем без MTL
              objLoader.load(modelPath, setObj)
            }
          )
        },
        undefined,
        (error) => {
          console.error('Error loading MTL:', error)
          // Fallback: загружаем только OBJ
          objLoader.load(modelPath, setObj)
        }
      )
    } else {
      // Загружаем только OBJ файл
      const objLoader = new OBJLoader()
      objLoader.load(modelPath, setObj)
    }
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
  
  // Плавная анимация вращения
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += hovered ? 0.01 : 0.003
      // Убираем вертикальное покачивание для более стабильного вида
    }
  })
  
  return (
    <group
      ref={meshRef}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {obj && <primitive object={obj} />}
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
        camera={{ position: [0, 0, 0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {/* Освещение */}
          <ambientLight intensity={enableEffects ? 0.4 : 0.8} />
          {enableEffects ? (
            <>
              <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={1}
                castShadow
                color="#00f5ff"
              />
              <spotLight
                position={[-10, -10, -10]}
                angle={0.15}
                penumbra={1}
                intensity={0.5}
                color="#bf00ff"
              />
            </>
          ) : (
            <>
              <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
              <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
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
            minDistance={1.5}
            maxDistance={6}
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