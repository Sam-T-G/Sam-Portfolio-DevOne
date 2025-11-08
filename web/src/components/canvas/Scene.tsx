"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

interface SceneProps {
  children: React.ReactNode;
  className?: string;
  enableControls?: boolean;
}

export default function Scene({ 
  children, 
  className = '',
  enableControls = false 
}: SceneProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]} // Cap pixel ratio for performance
        style={{ touchAction: 'none' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        
        {/* Optional Controls */}
        {enableControls && (
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            zoomToCursor={true}
            // Allow some vertical rotation while keeping horizon reasonable
            maxPolarAngle={Math.PI - 0.1}
            minPolarAngle={0.1}
            // Wheel zoom constraints
            minDistance={2}
            maxDistance={12}
            makeDefault
          />
        )}
        
        {/* Content with Suspense for loading */}
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
