"use client";
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
}

interface SpatialProjectCardsProps {
  projects: Project[];
  activeSection: string;
  onProjectClick?: (project: Project) => void;
}

export default function SpatialProjectCards({
  projects,
  activeSection,
  onProjectClick,
}: SpatialProjectCardsProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(0);

  // Position cards in orbit around the origin (octahedron center)
  const cardPositions = projects.map((_, index) => {
    const angle = (index / projects.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 8;
    return {
      position: [
        Math.cos(angle) * radius,
        Math.sin(index * 0.5) * 0.5, // Slight vertical variation
        Math.sin(angle) * radius,
      ] as [number, number, number],
      rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
    };
  });

  useFrame((state) => {
    if (!groupRef.current) return;

    // Fade in/out based on section
    const isProjectsSection = activeSection === 'projects';
    const targetOpacity = isProjectsSection ? 1 : 0;
    
    // Smooth opacity transition
    setOpacity(prevOpacity => THREE.MathUtils.lerp(
      prevOpacity,
      targetOpacity,
      0.05
    ));

    // Scale based on section progress
    const targetScale = isProjectsSection ? 1 : 0.8;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
    groupRef.current.scale.setScalar(newScale);

    // Gentle rotation of entire card group
    if (isProjectsSection) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  const handleCardClick = (index: number) => {
    if (activeIndex === index) {
      // Second click - open link
      if (onProjectClick) {
        onProjectClick(projects[index]);
      }
      setActiveIndex(null);
    } else {
      // First click - activate
      setActiveIndex(index);
    }
  };

  const isVisible = activeSection === 'projects';

  return (
    <group ref={groupRef} visible={isVisible}>
      {projects.map((project, index) => {
        const { position, rotation } = cardPositions[index];
        const isHovered = hoveredIndex === index;
        const isActive = activeIndex === index;

        return (
          <group
            key={project.id}
            position={position}
            rotation={rotation}
          >
            {/* Glassmorphic Card */}
            <group
              onPointerOver={() => setHoveredIndex(index)}
              onPointerOut={() => setHoveredIndex(null)}
              onClick={() => handleCardClick(index)}
            >
              {/* Main card surface */}
              <RoundedBox
                args={[2, 2.5, 0.1]}
                radius={0.1}
                smoothness={4}
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={isActive ? 0.95 : isHovered ? 0.85 : 0.75}
                  roughness={0.1}
                  metalness={0.1}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  transmission={0.1}
                  thickness={0.5}
                />
              </RoundedBox>

              {/* Accent border */}
              <RoundedBox
                args={[2.05, 2.55, 0.05]}
                radius={0.12}
                smoothness={4}
                position={[0, 0, -0.06]}
              >
                <meshStandardMaterial
                  color={project.color}
                  transparent
                  opacity={isActive ? 0.9 : isHovered ? 0.6 : 0.3}
                  emissive={project.color}
                  emissiveIntensity={isActive ? 0.5 : isHovered ? 0.3 : 0.1}
                />
              </RoundedBox>

              {/* Floating 3D HTML content */}
              <Html
                transform
                distanceFactor={5}
                position={[0, 0, 0.06]}
                style={{
                  width: '180px',
                  pointerEvents: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <div className="flex flex-col items-center gap-2 px-4 py-3 text-center">
                  {/* Icon indicator */}
                  <div 
                    className="h-10 w-10 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: project.color,
                      opacity: isActive ? 1 : isHovered ? 0.8 : 0.6,
                      transform: isActive ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                  
                  {/* Title */}
                  <h3 
                    className="text-sm font-bold tracking-tight"
                    style={{
                      color: '#1a1a1a',
                      opacity: opacity,
                    }}
                  >
                    {project.title}
                  </h3>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-xs font-medium"
                    style={{
                      color: project.color,
                      opacity: opacity * 0.9,
                    }}
                  >
                    {project.subtitle}
                  </p>

                  {/* Interaction hint */}
                  {isActive && (
                    <p 
                      className="mt-1 animate-pulse text-[10px] font-medium"
                      style={{
                        color: '#666',
                        opacity: opacity,
                      }}
                    >
                      Click to visit →
                    </p>
                  )}
                </div>
              </Html>

              {/* Glow effect when active */}
              {isActive && (
                <pointLight
                  position={[0, 0, 1]}
                  color={project.color}
                  intensity={0.5}
                  distance={3}
                />
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}
