"use client";
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface HeroCard3DProps {
  position: [number, number, number];
  expanded: boolean;
  activeSection: string;
}

export default function HeroCard3D({ position, expanded, activeSection }: HeroCard3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [scale, setScale] = useState(1);
  const isHeroSection = activeSection === 'home';

  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle floating animation
    const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    groupRef.current.position.y = position[1] + floatY;

    // Smooth scale transition
    const targetScale = expanded ? 1 : 0.6;
    const newScale = THREE.MathUtils.lerp(scale, targetScale, 0.08);
    setScale(newScale);
    groupRef.current.scale.setScalar(newScale);

    // Look at camera
    groupRef.current.lookAt(state.camera.position);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Glowing backdrop */}
      <mesh scale={expanded ? [4, 3, 0.1] : [2, 0.8, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#0891B2"
          emissive="#0891B2"
          emissiveIntensity={isHeroSection ? 0.5 : 0.2}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={expanded ? 2.5 : 1.5}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          color="#0891B2"
          transparent
          opacity={isHeroSection ? 0.3 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Content */}
      <Html
        center
        distanceFactor={8}
        transform
        sprite
        style={{
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      >
        {expanded ? (
          // EXPANDED STATE - Full Hero Content
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0a98, #1a1a1a95)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #0891B280',
              borderRadius: '16px',
              padding: '32px',
              minWidth: '400px',
              maxWidth: '500px',
              boxShadow: '0 0 40px #0891B240',
              textAlign: 'center',
            }}
          >
            {/* Name */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 8px 0',
                textShadow: '0 0 20px #0891B280',
                letterSpacing: '2px',
              }}
            >
              Samuel Gerungan
            </h1>

            {/* Divider */}
            <div
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #0891B2, transparent)',
                margin: '16px 0',
              }}
            />

            {/* Title */}
            <p
              style={{
                fontSize: '24px',
                color: '#0891B2',
                margin: '0 0 12px 0',
                fontWeight: '600',
                letterSpacing: '1px',
              }}
            >
              Full-Stack Developer
            </p>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '16px',
                color: '#cccccc',
                lineHeight: '1.6',
                margin: '0',
              }}
            >
              Building innovative solutions at the intersection of AI, design, and engineering
            </p>

            {/* Accent corners */}
            <div style={{ position: 'absolute', top: '0', left: '0', width: '30px', height: '30px', borderTop: '4px solid #0891B2', borderLeft: '4px solid #0891B2', borderRadius: '16px 0 0 0' }} />
            <div style={{ position: 'absolute', top: '0', right: '0', width: '30px', height: '30px', borderTop: '4px solid #0891B2', borderRight: '4px solid #0891B2', borderRadius: '0 16px 0 0' }} />
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '30px', height: '30px', borderBottom: '4px solid #0891B2', borderLeft: '4px solid #0891B2', borderRadius: '0 0 0 16px' }} />
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '30px', height: '30px', borderBottom: '4px solid #0891B2', borderRight: '4px solid #0891B2', borderRadius: '0 0 16px 0' }} />
          </div>
        ) : (
          // COMPRESSED STATE - Name Only
          <div
            style={{
              background: 'linear-gradient(135deg, #0a0a0a95, #1a1a1a90)',
              backdropFilter: 'blur(12px)',
              border: '2px solid #0891B260',
              borderRadius: '24px',
              padding: '12px 24px',
              boxShadow: '0 0 20px #0891B230',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0',
                textShadow: '0 0 10px #0891B260',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
              }}
            >
              Samuel Gerungan
            </h2>
          </div>
        )}
      </Html>

      {/* Ambient light */}
      <pointLight
        color="#0891B2"
        intensity={isHeroSection ? 1.5 : 0.5}
        distance={15}
        decay={2}
      />
    </group>
  );
}
