"use client";
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
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
      {/* Complex HUD Frame Structure */}
      {/* Main Octahedron Core */}
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={isActive ? "#0891B2" : "#666666"}
          emissive={isActive ? "#0891B2" : "#333333"}
          emissiveIntensity={isActive ? 1.2 : 0.4}
          wireframe
          transparent
          opacity={isActive ? 0.8 : 0.5}
        />
      </mesh>

      {/* Inner Icosahedron */}
      <mesh scale={0.6}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={isActive ? "#0891B2" : "#666666"}
          emissive={isActive ? "#0891B2" : "#444444"}
          emissiveIntensity={isActive ? 0.8 : 0.3}
          wireframe
          transparent
          opacity={isActive ? 0.6 : 0.4}
        />
      </mesh>

      {/* Rotating outer ring frames */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.08, 6, 24]} />
        <meshStandardMaterial
          color={isActive ? "#0891B2" : "#666666"}
          emissive={isActive ? "#0891B2" : "#333333"}
          emissiveIntensity={isActive ? 1.0 : 0.3}
          transparent
          opacity={isActive ? 0.9 : 0.5}
        />
      </mesh>

      {/* Secondary perpendicular ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.06, 6, 24]} />
        <meshStandardMaterial
          color={isActive ? "#0891B2" : "#666666"}
          emissive={isActive ? "#0891B2" : "#333333"}
          emissiveIntensity={isActive ? 0.8 : 0.2}
          transparent
          opacity={isActive ? 0.7 : 0.4}
        />
      </mesh>

      {/* HUD corner brackets - 4 corners */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => {
        const x = Math.cos(angle) * 1.8;
        const z = Math.sin(angle) * 1.8;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            {/* Vertical bracket line */}
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
              <meshStandardMaterial
                color={isActive ? "#0891B2" : "#666666"}
                emissive={isActive ? "#0891B2" : "#333333"}
                emissiveIntensity={isActive ? 1.0 : 0.3}
                transparent
                opacity={isActive ? 0.9 : 0.5}
              />
            </mesh>
            {/* Horizontal bracket line */}
            <mesh position={[-0.3, 0.6, 0]}>
              <boxGeometry args={[0.6, 0.08, 0.08]} />
              <meshStandardMaterial
                color={isActive ? "#0891B2" : "#666666"}
                emissive={isActive ? "#0891B2" : "#333333"}
                emissiveIntensity={isActive ? 1.0 : 0.3}
                transparent
                opacity={isActive ? 0.9 : 0.5}
              />
            </mesh>
          </group>
        );
      })}

      {/* Station Name - Integrated into center geometry */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.35}
        color={isActive ? "#0891B2" : "#cccccc"}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
        outlineWidth={0.02}
        outlineColor="#000000"
        outlineOpacity={0.8}
      >
        {section.name.toUpperCase()}
      </Text>

      {/* Glowing background plane for text */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2.5, 0.8]} />
        <meshBasicMaterial
          color={isActive ? "#0891B2" : "#333333"}
          transparent
          opacity={isActive ? 0.15 : 0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ambient glow */}
      <pointLight
        color="#0891B2"
        intensity={isActive ? 3 : 0.8}
        distance={10}
        decay={2}
      />

      {/* Particle field for active section */}
      {isActive && (
        <group>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const particleRadius = 2.2;
            const height = Math.sin(i * 0.8) * 0.4;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * particleRadius,
                  height,
                  Math.sin(angle) * particleRadius,
                ]}
              >
                <boxGeometry args={[0.06, 0.06, 0.06]} />
                <meshBasicMaterial
                  color="#0891B2"
                  transparent
                  opacity={0.7}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Orbital data lines - connecting to center */}
      {isActive && (
        <>
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => {
            const length = 2.5;
            return (
              <group key={`line-${i}`} rotation={[0, angle, 0]}>
                <mesh position={[length / 2, 0, 0]}>
                  <boxGeometry args={[length, 0.02, 0.02]} />
                  <meshBasicMaterial
                    color="#0891B2"
                    transparent
                    opacity={0.4}
                  />
                </mesh>
              </group>
            );
          })}
        </>
      )}
    </group>
  );
}
