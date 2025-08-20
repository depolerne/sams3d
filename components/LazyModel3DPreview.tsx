'use client';

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
  priority?: boolean; // Оставляем для совместимости
}

export default function LazyModel3DPreview({ 
  modelPath, 
  mtlPath, 
  className = ''
}: LazyModel3DPreviewProps) {
  console.log(`⚡ LazyModel3DPreview: Instant render for ${modelPath} (models preloaded)`);
  
  return (
    <div className={`w-full h-full ${className}`}>
      <Model3DPreview 
        modelPath={modelPath}
        mtlPath={mtlPath}
        className={className}
      />
    </div>
  );
}