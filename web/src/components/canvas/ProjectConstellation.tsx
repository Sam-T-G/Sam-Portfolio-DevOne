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
  autoFocusedIndex?: number | null;
}

// Different polyhedron types for variety - REFINED SCALE
const GEOMETRIES = [
  { type: 'tetrahedron', args: [0.8, 0] },
  { type: 'icosahedron', args: [0.75, 0] },
  { type: 'octahedron', args: [0.85, 0] },
  { type: 'dodecahedron', args: [0.7, 0] },
];

// Stable orbital configuration for projects
// Responsive based on viewport to keep projects visible on mobile
const getOrbitConfig = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return {
    radius: isMobile ? 3.5 : 6,  // Smaller orbit on mobile to stay in view
    height: 0,                    // Y-position (level with centerpiece)
    speed: 0.05,                  // Consistent orbital speed
    bobIntensity: isMobile ? 0.1 : 0.15,  // Less bob on mobile
    bobSpeed: 0.8,                // Bob frequency
  };
};

export default function ProjectConstellation({
  projects,
  activeSection,
  onProjectClick,
  onProjectFocus,
  resetTrigger,
  autoFocusedIndex,
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

  // Get responsive orbit configuration
  const orbitConfig = getOrbitConfig();

  // Calculate stable orbital positions - evenly spaced, predictable paths
  const projectOrbits = projects.map((_, index) => {
    // Even distribution around orbit (0°, 90°, 180°, 270°)
    const baseAngle = (index / projects.length) * Math.PI * 2;
    
    // Each project gets slight phase offset for bob timing variety
    const bobPhase = index * (Math.PI / 2);
    
    return {
      position: [
        Math.cos(baseAngle) * orbitConfig.radius,
        orbitConfig.height,
        Math.sin(baseAngle) * orbitConfig.radius,
      ] as [number, number, number],
      angle: baseAngle,
      radius: orbitConfig.radius,
      speed: orbitConfig.speed,
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
          const bobTime = state.clock.elapsedTime * orbitConfig.bobSpeed + orbit.bobPhase;
          const bobOffset = Math.sin(bobTime) * orbitConfig.bobIntensity;
          const targetY = orbitConfig.height + bobOffset;
          
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
        const isPending = pendingActivation === index;
        const isAutoFocused = autoFocusedIndex === index; // Check if this project is auto-focused from scroll
        const GeometryComponent = orbit.geometry.type;

        return (
          <group
            key={project.id}
            position={orbit.position}
          >
            {/* Connection line to center */}
            {(isHovered || isActive || isPending || isAutoFocused) && (
              <Line
                points={[
                  [0, 0, 0],
                  [-orbit.position[0], -orbit.position[1], -orbit.position[2]],
                ]}
                color={project.color}
                lineWidth={isActive ? 2 : isPending ? 1.5 : isAutoFocused ? 1.3 : 1}
                transparent
                opacity={opacity * (isActive ? 0.6 : isPending ? 0.5 : isAutoFocused ? 0.55 : 0.3)}
                dashed={!(isActive || isPending || isAutoFocused)}
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
                  isActive ? 1.2 : isPending ? 1.0 : isAutoFocused ? 1.1 : isHovered ? 0.8 : 0.4
                }
                transparent
                opacity={opacity * (isActive ? 1 : isPending ? 0.98 : isAutoFocused ? 0.96 : isHovered ? 0.95 : 0.85)}
              />
            </mesh>

            {/* Outer glow shell - ALWAYS visible for prominence */}
            <mesh scale={isActive ? 2.0 : isPending ? 1.8 : isAutoFocused ? 1.75 : isHovered ? 1.6 : 1.3}>
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
                  opacity={opacity * (isActive ? 0.4 : isPending ? 0.35 : isAutoFocused ? 0.33 : isHovered ? 0.25 : 0.12)}
                />
              </mesh>

            {/* Ambient light - always present for visibility */}
            <pointLight
              color={project.color}
              intensity={isActive ? 2.5 : isPending ? 1.5 : isAutoFocused ? 2.0 : isHovered ? 1.2 : 0.5}
              distance={10}
              decay={2}
            />

            {/* HUD nameplate - Always visible, expands on click */}
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
                style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #0a0a0a95, #1a1a1a90)',
                  backdropFilter: 'blur(12px)',
                  border: `2px solid ${project.color}80`,
                  borderRadius: '4px',
                  padding: (isActive || isAutoFocused) ? '12px' : '8px',
                  minWidth: (isActive || isAutoFocused) ? '180px' : '140px',
                  maxWidth: '240px',
                  boxShadow: (isActive || isAutoFocused) 
                    ? `0 0 30px ${project.color}60` 
                    : `0 0 15px ${project.color}30`,
                  fontFamily: '"Courier New", monospace',
                  opacity: opacity,
                  transform: (isActive || isAutoFocused) ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Corner Accents - only on active/auto-focused */}
                {(isActive || isAutoFocused) && (
                  <>
                    <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '16px', borderTop: `3px solid ${project.color}`, borderLeft: `3px solid ${project.color}` }} />
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderTop: `3px solid ${project.color}`, borderRight: `3px solid ${project.color}` }} />
                    <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '16px', height: '16px', borderBottom: `3px solid ${project.color}`, borderLeft: `3px solid ${project.color}` }} />
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderBottom: `3px solid ${project.color}`, borderRight: `3px solid ${project.color}` }} />
                  </>
                )}

                {/* Title - Always shown */}
                <h3 
                  style={{
                    color: '#ffffff',
                    fontSize: (isActive || isAutoFocused) ? '14px' : '12px',
                    fontWeight: 'bold',
                    margin: '0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textShadow: `0 0 10px ${project.color}60`,
                    textAlign: 'center',
                  }}
                >
                  {project.title}
                </h3>
                
                {/* Expanded content - Only on active/auto-focused */}
                {(isActive || isAutoFocused) && (
                  <>
                    {/* Subtitle */}
                    <p 
                      style={{
                        color: project.color,
                        fontSize: '11px',
                        margin: '4px 0 8px 0',
                        opacity: 0.9,
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                        textAlign: 'center',
                      }}
                    >
                      {project.subtitle}
                    </p>

                    {/* Divider */}
                    <div 
                      style={{
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, ${project.color}60, transparent)`,
                        margin: '8px 0',
                      }}
                    />

                    {/* Action hint */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px 8px',
                        background: `${project.color}15`,
                        border: `1px solid ${project.color}40`,
                        borderRadius: '2px',
                        color: project.color,
                        fontSize: '9px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isPending ? 'NAVIGATING' : 'CLICK TO VISIT'}
                    </div>
                  </>
                )}

                {/* Noise Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff02 2px, #ffffff02 4px)',
                  pointerEvents: 'none',
                  opacity: 0.3,
                  borderRadius: '4px',
                }} />
              </div>
            </Html>

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
