"use client";
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
}

interface ProjectConstellationProps {
  projects: Project[];
  activeSection: string;
  sectionProgress: number;
  onProjectClick?: (project: Project) => void;
  focusedProjectId?: number | null;
  onProjectFocus?: (project: Project | null, position: [number, number, number]) => void;
  resetTrigger?: boolean;
}

// Different polyhedron types for variety - LARGER for visibility
const GEOMETRIES = [
  { type: 'tetrahedron', args: [1.4, 0] },
  { type: 'icosahedron', args: [1.3, 0] },
  { type: 'octahedron', args: [1.5, 0] },
  { type: 'dodecahedron', args: [1.2, 0] },
];

export default function ProjectConstellation({
  projects,
  activeSection,
  sectionProgress,
  onProjectClick,
  focusedProjectId,
  onProjectFocus,
  resetTrigger,
}: ProjectConstellationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(0);
  const currentPositionsRef = useRef<Map<number, [number, number, number]>>(new Map());
  const scaleRef = useRef<Map<number, number>>(new Map());
  const meshRefs = useRef<Map<number, THREE.Mesh>>(new Map());

  // Viewport constraints - keep projects within visible bounds
  const VIEWPORT_BOUNDS = {
    x: { min: -10, max: 10 },
    y: { min: -3, max: 4 },
    z: { min: -10, max: 10 },
  };

  // Calculate orchestrated positions based on scroll progress
  const projectOrbits = projects.map((_, index) => {
    const baseAngle = (index / projects.length) * Math.PI * 2;
    const baseRadius = 5 + Math.sin(index * 1.2) * 0.8; // Slightly tighter
    const baseHeight = Math.cos(index * 0.8) * 1.2;
    const speed = 0.06 + index * 0.025;
    
    // Create unique trajectory for each project based on scroll
    // Projects follow elegant paths as user scrolls through projects section
    const trajectoryOffset = Math.sin(sectionProgress * Math.PI * 2 + index) * 2;
    const heightOffset = Math.cos(sectionProgress * Math.PI + index * 0.5) * 1;
    
    return {
      position: [
        Math.cos(baseAngle) * baseRadius,
        baseHeight,
        Math.sin(baseAngle) * baseRadius,
      ] as [number, number, number],
      angle: baseAngle,
      radius: baseRadius,
      speed,
      trajectoryOffset,
      heightOffset,
      geometry: GEOMETRIES[index % GEOMETRIES.length],
    };
  });

  useFrame((state) => {
    if (!groupRef.current) return;

    const isProjectsSection = activeSection === 'projects';
    // Always visible, but more prominent in projects section
    const targetOpacity = isProjectsSection ? 1 : 0.6;
    
    // Smooth opacity transition
    setOpacity(prevOpacity => THREE.MathUtils.lerp(
      prevOpacity,
      targetOpacity,
      0.05
    ));

    // Scale based on section
    const targetScale = isProjectsSection ? 1 : 0.7;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
    groupRef.current.scale.setScalar(newScale);

    // Individual polyhedron rotations
    groupRef.current.children.forEach((child, index) => {
      if (child.type === 'Group') {
        const orbit = projectOrbits[index];
        const isHovered = hoveredIndex === index;
        const isActive = activeIndex === index;
        
        // When active (focused), stop rotation and bob gently
        if (isActive) {
          // Freeze rotation (don't update, stays at current angles)
          // This creates stillness for focused state
          
          // Gentle bobbing motion
          const bobY = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
          const swayX = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
          const swayZ = Math.cos(state.clock.elapsedTime * 0.9) * 0.06;
          
          // Apply subtle organic movement
          child.position.y += bobY * 0.01;
          child.position.x += swayX * 0.01;
          child.position.z += swayZ * 0.01;
        } else {
          // Normal rotation when not focused
          child.rotation.x = state.clock.elapsedTime * 0.3;
          child.rotation.y = state.clock.elapsedTime * 0.5;
          
          // Faster rotation when hovered
          if (isHovered) {
            child.rotation.y += Math.sin(state.clock.elapsedTime * 2) * 0.1;
          }
          
          // Orchestrated movement with scroll-based choreography
          const time = state.clock.elapsedTime * orbit.speed;
          const newAngle = orbit.angle + time;
          
          // Base orbital position
          let newX = Math.cos(newAngle) * orbit.radius;
          let newZ = Math.sin(newAngle) * orbit.radius;
          
          // Add scroll-based trajectory variation (elegant paths)
          if (isProjectsSection) {
            newX += orbit.trajectoryOffset * sectionProgress;
            newZ += orbit.trajectoryOffset * (1 - sectionProgress) * 0.5;
          }
          
          // Apply viewport constraints - clamp positions
          newX = THREE.MathUtils.clamp(newX, VIEWPORT_BOUNDS.x.min, VIEWPORT_BOUNDS.x.max);
          newZ = THREE.MathUtils.clamp(newZ, VIEWPORT_BOUNDS.z.min, VIEWPORT_BOUNDS.z.max);
          
          // Smooth position update
          child.position.x = THREE.MathUtils.lerp(child.position.x, newX, 0.05);
          child.position.z = THREE.MathUtils.lerp(child.position.z, newZ, 0.05);
          
          // Floating Y movement with scroll-based height variation
          let floatY = orbit.position[1] + Math.sin(time * 0.5) * 0.3;
          if (isProjectsSection) {
            floatY += orbit.heightOffset * sectionProgress;
          }
          floatY = THREE.MathUtils.clamp(floatY, VIEWPORT_BOUNDS.y.min, VIEWPORT_BOUNDS.y.max);
          child.position.y = THREE.MathUtils.lerp(child.position.y, floatY, 0.05);
        }
        
        // Store current position for camera focusing
        currentPositionsRef.current.set(index, [child.position.x, child.position.y, child.position.z]);
        
        // Smooth scale interpolation with easing curve
        const targetScale = isActive ? 1.5 : isHovered ? 1.2 : 1;
        const currentScale = scaleRef.current.get(index) || 1;
        
        // Ease-out cubic curve for smooth animation
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
        scaleRef.current.set(index, newScale);
        
        // Apply scale to mesh directly
        const mesh = meshRefs.current.get(index);
        if (mesh) {
          mesh.scale.setScalar(newScale);
        }
      }
    });
  });

  // Reset when focus is cleared externally (ESC key)
  useEffect(() => {
    if (resetTrigger && activeIndex !== null) {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        setActiveIndex(null);
        setHoveredIndex(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resetTrigger, activeIndex]);

  const handleClick = (index: number) => {
    const project = projects[index];
    
    if (activeIndex === index) {
      // Second click - open link
      if (onProjectClick) {
        onProjectClick(project);
      }
      setActiveIndex(null);
      if (onProjectFocus) {
        onProjectFocus(null, [0, 0, 0]);
      }
    } else {
      // First click - activate and focus camera
      setActiveIndex(index);
      if (onProjectFocus) {
        // Use tracked position from useFrame
        const position = currentPositionsRef.current.get(index) || [0, 0, 0];
        onProjectFocus(project, position);
      }
    }
  };

  const isVisible = activeSection === 'projects';

  return (
    <group ref={groupRef} visible={isVisible}>
      {projects.map((project, index) => {
        const orbit = projectOrbits[index];
        const isHovered = hoveredIndex === index;
        const isActive = activeIndex === index;
        const GeometryComponent = orbit.geometry.type;

        return (
          <group
            key={project.id}
            position={orbit.position}
          >
            {/* Connection line to center */}
            {(isHovered || isActive) && (
              <Line
                points={[
                  [0, 0, 0],
                  [-orbit.position[0], -orbit.position[1], -orbit.position[2]],
                ]}
                color={project.color}
                lineWidth={isActive ? 2 : 1}
                transparent
                opacity={opacity * (isActive ? 0.6 : 0.3)}
                dashed={!isActive}
                dashScale={2}
                gapSize={0.5}
              />
            )}

            {/* Polyhedron - Interactive */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIndex(index);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredIndex(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(index);
              }}
              ref={(mesh) => {
                if (mesh) {
                  meshRefs.current.set(index, mesh);
                }
              }}
            >
              {GeometryComponent === 'tetrahedron' && (
                <tetrahedronGeometry args={orbit.geometry.args as [number, number]} />
              )}
              {GeometryComponent === 'icosahedron' && (
                <icosahedronGeometry args={orbit.geometry.args as [number, number]} />
              )}
              {GeometryComponent === 'octahedron' && (
                <octahedronGeometry args={orbit.geometry.args as [number, number]} />
              )}
              {GeometryComponent === 'dodecahedron' && (
                <dodecahedronGeometry args={orbit.geometry.args as [number, number]} />
              )}
              
              <meshStandardMaterial
                color={project.color}
                wireframe
                wireframeLinewidth={3}
                emissive={project.color}
                emissiveIntensity={
                  isActive ? 1.2 : isHovered ? 0.8 : 0.4
                }
                transparent
                opacity={opacity * (isActive ? 1 : isHovered ? 0.95 : 0.85)}
              />
            </mesh>

            {/* Outer glow shell - ALWAYS visible for prominence */}
            <mesh scale={isActive ? 2.0 : isHovered ? 1.6 : 1.3}>
                {GeometryComponent === 'tetrahedron' && (
                  <tetrahedronGeometry args={orbit.geometry.args as [number, number]} />
                )}
                {GeometryComponent === 'icosahedron' && (
                  <icosahedronGeometry args={orbit.geometry.args as [number, number]} />
                )}
                {GeometryComponent === 'octahedron' && (
                  <octahedronGeometry args={orbit.geometry.args as [number, number]} />
                )}
                {GeometryComponent === 'dodecahedron' && (
                  <dodecahedronGeometry args={orbit.geometry.args as [number, number]} />
                )}
                
                <meshBasicMaterial
                  color={project.color}
                  wireframe
                  transparent
                  opacity={opacity * (isActive ? 0.4 : isHovered ? 0.25 : 0.12)}
                />
              </mesh>

            {/* Ambient light - always present for visibility */}
            <pointLight
              color={project.color}
              intensity={isActive ? 2.5 : isHovered ? 1.2 : 0.5}
              distance={10}
              decay={2}
            />

            {/* Holographic info panel - Always upright */}
            {(isHovered || isActive) && (
              <Html
                center
                distanceFactor={6}
                position={[0, 2, 0]}
                sprite
                style={{
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              >
                <div 
                  className="flex flex-col items-center gap-1 px-4 py-3"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}15, ${project.color}25)`,
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: `1px solid ${project.color}40`,
                    boxShadow: `0 8px 32px ${project.color}30`,
                    minWidth: '160px',
                    opacity: opacity,
                  }}
                >
                  {/* Title */}
                  <h3 
                    className="text-sm font-bold tracking-tight"
                    style={{
                      color: project.color,
                      textShadow: `0 0 10px ${project.color}80`,
                    }}
                  >
                    {project.title}
                  </h3>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-xs font-medium"
                    style={{
                      color: '#ffffff',
                      opacity: 0.9,
                    }}
                  >
                    {project.subtitle}
                  </p>

                  {/* Divider */}
                  <div 
                    className="h-px w-full my-1"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${project.color}60, transparent)`,
                    }}
                  />

                  {/* Action hint */}
                  {isActive ? (
                    <p 
                      className="text-[10px] font-semibold animate-pulse"
                      style={{
                        color: project.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      ✨ Click to visit
                    </p>
                  ) : (
                    <p 
                      className="text-[10px]"
                      style={{
                        color: '#ffffff',
                        opacity: 0.6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      Click to focus
                    </p>
                  )}
                </div>
              </Html>
            )}

            {/* Particle burst on active */}
            {isActive && (
              <group>
                {Array.from({ length: 12 }).map((_, i) => {
                  const particleAngle = (i / 12) * Math.PI * 2;
                  const particleRadius = 2 + Math.sin(i * 0.5) * 0.3;
                  return (
                    <mesh
                      key={i}
                      position={[
                        Math.cos(particleAngle) * particleRadius,
                        Math.sin(i * 0.3) * 0.5,
                        Math.sin(particleAngle) * particleRadius,
                      ]}
                    >
                      <sphereGeometry args={[0.04, 8, 8]} />
                      <meshBasicMaterial
                        color={project.color}
                        transparent
                        opacity={opacity * 0.6}
                      />
                    </mesh>
                  );
                })}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}
