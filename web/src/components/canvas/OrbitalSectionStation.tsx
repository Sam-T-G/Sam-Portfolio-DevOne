"use client";
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Utility to project 3D position to 2D screen coordinates
function project3DTo2D(
  position: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const vector = position.clone().project(camera);
  return {
    x: (vector.x * 0.5 + 0.5) * width,
    y: (-(vector.y * 0.5) + 0.5) * height,
  };
}

interface OrbitalSectionStationProps {
  section: {
    name: string;
    angle: number;
    height: number;
  };
  radius: number;
  activeSection: string;
  onNavigate?: () => void;
}

export default function OrbitalSectionStation({
  section,
  radius,
  activeSection,
  onNavigate,
}: OrbitalSectionStationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const isActive = activeSection === section.name;
  const { camera, size } = useThree();

  // Calculate position based on angle and radius
  const position: [number, number, number] = [
    Math.cos(section.angle) * radius,
    section.height,
    Math.sin(section.angle) * radius,
  ];

  useFrame((state) => {
    if (!groupRef.current || !ringRef.current) return;

    // Gentle floating animation
    const floatY = Math.sin(state.clock.elapsedTime * 0.5 + section.angle) * 0.1;
    groupRef.current.position.y = position[1] + floatY;

    // Ring rotation
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

    // Look at camera
    groupRef.current.lookAt(state.camera.position);
  });

  const handlePointerOver = () => {
    const worldPos = new THREE.Vector3(position[0], position[1], position[2]);
    const screenPos = project3DTo2D(worldPos, camera, size.width, size.height);
    const distance = Math.sqrt(
      position[0] ** 2 + position[1] ** 2 + position[2] ** 2
    );
    
    window.dispatchEvent(new CustomEvent('show-hud', {
      detail: {
        targetName: section.name.toUpperCase(),
        targetType: 'section',
        subtitle: `Navigation Station`,
        description: `Orbital waypoint for the ${section.name} experience sector. Click to navigate directly.`,
        status: isActive ? 'CURRENT SECTOR' : 'AVAILABLE',
        distance,
        coordinates: { x: position[0], y: position[1], z: position[2] },
        metadata: {
          'Angle': `${Math.round((section.angle * 180) / Math.PI)}°`,
          'Altitude': `${position[1].toFixed(2)}u`,
          'Orbit': `${radius.toFixed(1)}u`,
        },
        actionHint: isActive ? 'CURRENT LOCATION' : 'CLICK TO NAVIGATE',
        color: isActive ? '#0891B2' : '#666666',
        position: screenPos,
      }
    }));
  };

  const handlePointerOut = () => {
    window.dispatchEvent(new CustomEvent('hide-hud'));
  };

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1], position[2]]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Outer ring indicator */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.1, 8, 32]} />
        <meshStandardMaterial
          color={isActive ? "#0891B2" : "#666666"}
          emissive={isActive ? "#0891B2" : "#333333"}
          emissiveIntensity={isActive ? 0.8 : 0.2}
          transparent
          opacity={isActive ? 1 : 0.4}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh scale={isActive ? 0.6 : 0.4}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#0891B2"
          emissive="#0891B2"
          emissiveIntensity={isActive ? 1.5 : 0.5}
          transparent
          opacity={isActive ? 0.8 : 0.3}
        />
      </mesh>

      {/* Ambient glow */}
      <pointLight
        color="#0891B2"
        intensity={isActive ? 2 : 0.5}
        distance={8}
        decay={2}
      />

      {/* Interactive label */}
      <Html
        center
        distanceFactor={8}
        position={[0, -2, 0]}
        style={{
          transition: 'all 0.3s ease',
          pointerEvents: onNavigate ? 'auto' : 'none',
          cursor: onNavigate ? 'pointer' : 'default',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onNavigate) onNavigate();
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${isActive ? '#0891B230' : '#66666620'}, ${isActive ? '#0891B240' : '#66666630'})`,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: `2px solid ${isActive ? '#0891B2' : '#666666'}`,
            boxShadow: `0 4px 20px ${isActive ? '#0891B250' : '#00000030'}`,
            padding: '8px 16px',
            minWidth: '120px',
            textAlign: 'center',
            opacity: isActive ? 1 : 0.7,
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <h3
            style={{
              color: isActive ? '#0891B2' : '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
              margin: 0,
              textTransform: 'capitalize',
              textShadow: isActive ? '0 0 10px #0891B280' : 'none',
            }}
          >
            {section.name}
          </h3>
        </div>
      </Html>

      {/* Particle ring for active section */}
      {isActive && (
        <group>
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const particleRadius = 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * particleRadius,
                  Math.sin(i * 0.5) * 0.2,
                  Math.sin(angle) * particleRadius,
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial
                  color="#0891B2"
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}
