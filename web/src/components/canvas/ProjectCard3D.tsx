"use client";
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ProjectCard3DProps {
  position: [number, number, number];
  title: string;
  subtitle: string;
  color: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export default function ProjectCard3D({
  position,
  title,
  subtitle,
  color,
  index,
  isActive,
  onClick,
}: ProjectCard3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const scaleTarget = useRef(1);

  // Enhanced idle animation with polish
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle breathing effect when not active
    if (!isActive) {
      const breathe = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.02;
      groupRef.current.position.y = position[1] + breathe;
    } else {
      // Smooth return to base position when active
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        position[1],
        0.1
      );
    }
    
    // Enhanced rotation on hover with smoother easing
    if (hovered && !isActive) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0.15,
        0.08
      );
      scaleTarget.current = 1.05;
    } else if (!isActive) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        0.08
      );
      scaleTarget.current = 1.0;
    } else {
      // Active state: slight scale up and no rotation
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        0.15
      );
      scaleTarget.current = 1.08;
    }
    
    // Smooth scale animation
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, scaleTarget.current, 0.1);
    groupRef.current.scale.setScalar(newScale);
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float
        speed={1.5}
        rotationIntensity={isActive ? 0 : 0.2}
        floatIntensity={isActive ? 0 : 0.3}
        enabled={!isActive}
      >
        {/* Main Card Body - Rounded Box */}
        <RoundedBox
          args={[2.5, 3.5, 0.15]}
          radius={0.05}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={isActive ? color : hovered ? '#f8f8f8' : '#ffffff'}
            roughness={isActive ? 0.2 : hovered ? 0.25 : 0.3}
            metalness={isActive ? 0.15 : 0.1}
            emissive={isActive ? color : hovered ? color : '#000000'}
            emissiveIntensity={isActive ? 0.25 : hovered ? 0.05 : 0}
          />
        </RoundedBox>

        {/* Card Border/Frame */}
        <RoundedBox
          args={[2.6, 3.6, 0.1]}
          radius={0.06}
          smoothness={4}
          position={[0, 0, -0.08]}
        >
          <meshStandardMaterial
            color={isActive ? color : '#1a1a1a'}
            roughness={0.4}
            metalness={0.9}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.1 : 0}
          />
        </RoundedBox>

        {/* Title Text */}
        <Text
          position={[0, 1, 0.1]}
          fontSize={0.25}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {title}
        </Text>

        {/* Subtitle Text */}
        <Text
          position={[0, 0.6, 0.1]}
          fontSize={0.15}
          color={color}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {subtitle}
        </Text>

        {/* Decorative Icon/Shape - rotates on hover */}
        <mesh 
          position={[0, -0.3, 0.1]}
          rotation={[
            0, 
            hovered || isActive ? Math.PI / 4 : 0,
            0
          ]}
        >
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={color}
            wireframe
            wireframeLinewidth={2}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
          />
        </mesh>

        {/* Accent Line */}
        <mesh position={[0, 0.3, 0.1]}>
          <boxGeometry args={[1.8, 0.02, 0.01]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Interactive Indicator - Glowing Ring when Hovered */}
        {(hovered || isActive) && (
          <mesh position={[0, 0, 0.2]} rotation={[0, 0, 0]}>
            <ringGeometry args={[1.4, 1.5, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isActive ? 0.9 : 0.5}
            />
          </mesh>
        )}
        
        {/* Subtle glow effect for active cards */}
        {isActive && (
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[3, 4]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.1}
            />
          </mesh>
        )}

        {/* HTML Overlay for Rich Content (when active) */}
        {isActive && (
          <Html
            transform
            occlude
            position={[0, -1.4, 0.1]}
            style={{
              width: '220px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div className="animate-fade-in rounded-xl bg-gradient-to-b from-white/95 to-white/90 px-5 py-3 text-xs shadow-xl backdrop-blur-md">
              <p className="font-bold text-gray-900">Click again to visit project</p>
              <p className="mt-1 text-[10px] text-gray-600">or press ESC to return</p>
            </div>
          </Html>
        )}
      </Float>

      {/* Shadow Plane */}
      <mesh 
        position={[0, -2, -0.5]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 3]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}
