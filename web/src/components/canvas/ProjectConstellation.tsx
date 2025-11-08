"use client";
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
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
  onProjectClick?: (project: Project) => void;
  onProjectFocus?: (project: Project | null, position: [number, number, number]) => void;
  resetTrigger?: boolean;
}

// Different polyhedron types for variety - REFINED SCALE
const GEOMETRIES = [
  { type: 'tetrahedron', args: [0.8, 0] },
  { type: 'icosahedron', args: [0.75, 0] },
  { type: 'octahedron', args: [0.85, 0] },
  { type: 'dodecahedron', args: [0.7, 0] },
];

// Stable orbital configuration for projects
const PROJECT_ORBIT_CONFIG = {
  radius: 6,           // Fixed distance from centerpiece
  height: 0,           // Y-position (level with centerpiece)
  speed: 0.05,         // Consistent orbital speed
  bobIntensity: 0.15,  // Subtle vertical bobbing
  bobSpeed: 0.8,       // Bob frequency
};

export default function ProjectConstellation({
  projects,
  activeSection,
  onProjectClick,
  onProjectFocus,
  resetTrigger,
}: ProjectConstellationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pendingActivation, setPendingActivation] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(0);
  const currentPositionsRef = useRef<Map<number, [number, number, number]>>(new Map());
  const scaleRef = useRef<Map<number, number>>(new Map());
  const meshRefs = useRef<Map<number, THREE.Mesh>>(new Map());
  const { camera, size } = useThree();

  // Calculate stable orbital positions - evenly spaced, predictable paths
  const projectOrbits = projects.map((_, index) => {
    // Even distribution around orbit (0°, 90°, 180°, 270°)
    const baseAngle = (index / projects.length) * Math.PI * 2;
    
    // Each project gets slight phase offset for bob timing variety
    const bobPhase = index * (Math.PI / 2);
    
    return {
      position: [
        Math.cos(baseAngle) * PROJECT_ORBIT_CONFIG.radius,
        PROJECT_ORBIT_CONFIG.height,
        Math.sin(baseAngle) * PROJECT_ORBIT_CONFIG.radius,
      ] as [number, number, number],
      angle: baseAngle,
      radius: PROJECT_ORBIT_CONFIG.radius,
      speed: PROJECT_ORBIT_CONFIG.speed,
      bobPhase,
      geometry: GEOMETRIES[index % GEOMETRIES.length],
    };
  });

  useFrame((state) => {
    if (!groupRef.current) return;

    const isProjectsSection = activeSection === 'projects';
    // Always visible - subtle in other sections, prominent in projects
    const targetOpacity = isProjectsSection ? 1 : 0.35;
    
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
        const isPending = pendingActivation === index;
        
        // When active or pending (focused), stop rotation and bob gently
        if (isActive || isPending) {
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
          // Consistent rotation for all polyhedrons
          child.rotation.x = state.clock.elapsedTime * 0.3;
          child.rotation.y = state.clock.elapsedTime * 0.5;
          
          // Faster rotation when hovered
          if (isHovered) {
            child.rotation.y += Math.sin(state.clock.elapsedTime * 2) * 0.1;
          }
          
          // STABLE ORBITAL MOTION - predictable circular path
          const time = state.clock.elapsedTime * orbit.speed;
          const currentAngle = orbit.angle + time;
          
          // Calculate position on circular orbit
          const newX = Math.cos(currentAngle) * orbit.radius;
          const newZ = Math.sin(currentAngle) * orbit.radius;
          
          // Smooth position update
          child.position.x = THREE.MathUtils.lerp(child.position.x, newX, 0.08);
          child.position.z = THREE.MathUtils.lerp(child.position.z, newZ, 0.08);
          
          // Subtle vertical bobbing - each project has unique phase
          const bobTime = state.clock.elapsedTime * PROJECT_ORBIT_CONFIG.bobSpeed + orbit.bobPhase;
          const bobOffset = Math.sin(bobTime) * PROJECT_ORBIT_CONFIG.bobIntensity;
          const targetY = PROJECT_ORBIT_CONFIG.height + bobOffset;
          
          child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.08);
        }
        
        // Store current position for camera focusing
        currentPositionsRef.current.set(index, [child.position.x, child.position.y, child.position.z]);
        
        // Smooth scale interpolation with easing curve
        const targetScale = isActive ? 1.5 : isPending ? 1.3 : isHovered ? 1.2 : 1;
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
        setPendingActivation(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resetTrigger, activeIndex]);

  // Activate pending project when we arrive at projects section
  useEffect(() => {
    if (activeSection === 'projects' && pendingActivation !== null) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        const project = projects[pendingActivation];
        setActiveIndex(pendingActivation);
        if (onProjectFocus) {
          const position = currentPositionsRef.current.get(pendingActivation) || [
            projectOrbits[pendingActivation]?.position[0] || 0,
            projectOrbits[pendingActivation]?.position[1] || 0,
            projectOrbits[pendingActivation]?.position[2] || 0,
          ];
          onProjectFocus(project, position);
        }
        setPendingActivation(null);
      }, 300); // Delay for smooth scroll completion
      return () => clearTimeout(timer);
    }
  }, [activeSection, pendingActivation, projects, onProjectFocus, projectOrbits]);

  const handleClick = (index: number) => {
    const project = projects[index];
    
    // If not in projects section, set pending activation and navigate
    if (activeSection !== 'projects') {
      // Store which project should be activated
      setPendingActivation(index);
      
      // Scroll to projects section smoothly
      const vh = window.innerHeight;
      window.scrollTo({
        top: vh, // Projects section starts at 1vh
        behavior: 'smooth'
      });
      // The useEffect will handle activation once we arrive
      return;
    }
    
    // In projects section: handle focus/open behavior
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

  return (
    <group ref={groupRef}>
      {projects.map((project, index) => {
        const orbit = projectOrbits[index];
        const isHovered = hoveredIndex === index;
        const isActive = activeIndex === index;
        const isPending = pendingActivation === index; // Check if this project is pending activation
        const GeometryComponent = orbit.geometry.type;

        return (
          <group
            key={project.id}
            position={orbit.position}
          >
            {/* Connection line to center */}
            {(isHovered || isActive || isPending) && (
              <Line
                points={[
                  [0, 0, 0],
                  [-orbit.position[0], -orbit.position[1], -orbit.position[2]],
                ]}
                color={project.color}
                lineWidth={isActive ? 2 : isPending ? 1.5 : 1}
                transparent
                opacity={opacity * (isActive ? 0.6 : isPending ? 0.5 : 0.3)}
                dashed={!(isActive || isPending)}
                dashScale={2}
                gapSize={0.5}
              />
            )}

            {/* Polyhedron - Interactive */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIndex(index);
                
                // Show game HUD with 2D screen position
                const position = currentPositionsRef.current.get(index) || orbit.position;
                const worldPos = new THREE.Vector3(position[0], position[1], position[2]);
                const screenPos = project3DTo2D(worldPos, camera, size.width, size.height);
                const distance = Math.sqrt(
                  position[0] ** 2 + position[1] ** 2 + position[2] ** 2
                );
                
                window.dispatchEvent(new CustomEvent('show-hud', {
                  detail: {
                    targetName: project.title,
                    targetType: 'project',
                    subtitle: project.subtitle,
                    description: `Advanced ${project.subtitle.toLowerCase()} leveraging cutting-edge technology.`,
                    status: 'AVAILABLE',
                    distance,
                    coordinates: { x: position[0], y: position[1], z: position[2] },
                    metadata: {
                      'Type': GeometryComponent,
                      'Status': isPending ? 'LOADING' : isActive ? 'FOCUSED' : 'IDLE',
                      'Index': `#${String(index + 1).padStart(2, '0')}`,
                    },
                    actionHint: activeSection === 'projects' && isActive 
                      ? 'CLICK TO VISIT PROJECT' 
                      : activeSection === 'projects'
                      ? 'CLICK TO FOCUS'
                      : 'CLICK TO NAVIGATE',
                    color: project.color,
                    position: screenPos,
                  }
                }));
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredIndex(null);
                
                // Hide game HUD
                window.dispatchEvent(new CustomEvent('hide-hud'));
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Unlock HUD before handling click
                window.dispatchEvent(new CustomEvent('unlock-hud'));
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
                  isActive ? 1.2 : isPending ? 1.0 : isHovered ? 0.8 : 0.4
                }
                transparent
                opacity={opacity * (isActive ? 1 : isPending ? 0.98 : isHovered ? 0.95 : 0.85)}
              />
            </mesh>

            {/* Outer glow shell - ALWAYS visible for prominence */}
            <mesh scale={isActive ? 2.0 : isPending ? 1.8 : isHovered ? 1.6 : 1.3}>
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
                  opacity={opacity * (isActive ? 0.4 : isPending ? 0.35 : isHovered ? 0.25 : 0.12)}
                />
              </mesh>

            {/* Ambient light - always present for visibility */}
            <pointLight
              color={project.color}
              intensity={isActive ? 2.5 : isPending ? 1.5 : isHovered ? 1.2 : 0.5}
              distance={10}
              decay={2}
            />

            {/* Holographic info panel - Show on hover, active, or pending */}
            {(isHovered || isActive || isPending) && (
              <Html
                center
                distanceFactor={6}
                position={[0, 2, 0]}
                sprite
                style={{
                  transition: 'all 0.3s ease',
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
                    opacity: opacity * (isPending ? 0.9 : 1),
                    transform: (isActive || isPending) ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {/* Title - Always shown when visible */}
                  <h3 
                    className="text-sm font-bold tracking-tight"
                    style={{
                      color: project.color,
                      textShadow: `0 0 10px ${project.color}80`,
                    }}
                  >
                    {project.title}
                  </h3>
                  
                  {/* Subtitle - Always shown when visible */}
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
                  {isPending ? (
                    <p 
                      className="text-[10px] font-semibold animate-pulse"
                      style={{
                        color: project.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      🚀 Navigating...
                    </p>
                  ) : activeSection === 'projects' && isActive ? (
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
                      Click to view projects
                    </p>
                  )}
                </div>
              </Html>
            )}

            {/* Particle burst on active or pending */}
            {(isActive || isPending) && (
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
                        opacity={opacity * (isPending ? 0.4 : 0.6)}
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
