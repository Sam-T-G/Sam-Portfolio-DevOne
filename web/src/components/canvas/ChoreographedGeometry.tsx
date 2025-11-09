"use client";
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import CinematicShowcase from './CinematicShowcase';
import SpatialInstructions from './SpatialInstructions';
import AmbientGeometry from './AmbientGeometry';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
}

interface FocusedProject {
  project: Project;
  position: [number, number, number];
}

interface ChoreographedGeometryProps {
  scrollProgress: number;
  activeSection: string;
  sectionProgress: number;
  projects?: Project[];
  onProjectClick?: (project: Project) => void;
  focusedProject?: FocusedProject | null;
  onProjectFocus?: (project: Project | null, position: [number, number, number]) => void;
  resetTrigger?: boolean;
}

// Camera waypoint definition
interface CameraWaypoint {
  position: [number, number, number];
  lookAt: [number, number, number];
  rotationSpeed: number;
  floatIntensity: number;
}

// Orbital camera configuration - smooth 360° journey
export const ORBITAL_CONFIG = {
  cameraRadius: 12,        // Camera distance from centerpiece
  sectionRadius: 10,       // Section orbital station distance
  height: 2,               // Camera height variation
  sections: {
    home: { angle: 0, height: 1 },           // Front (0°)
    projects: { angle: Math.PI / 2, height: 0.5 },     // Right (90°)
    skills: { angle: Math.PI, height: 1.5 },           // Back (180°)
    contact: { angle: (Math.PI * 3) / 2, height: 0 },  // Left (270°)
  }
};

// Define camera choreography for each section as orbital waypoints
// Camera positioned at 2/3 horizontal offset from each station for comfortable viewing
const CAMERA_CHOREOGRAPHY: Record<string, {
  entry: CameraWaypoint;
  exit: CameraWaypoint;
  easing?: (t: number) => number;
}> = {
  home: {
    entry: {
      // Station at (10, 1, 0) - Camera offset right side
      position: [8, 1.5, 5],  // Right offset, comfortable distance
      lookAt: [0, 0, 0],
      rotationSpeed: 1.0,
      floatIntensity: 0.5,
    },
    exit: {
      position: [6, 1.25, 7],  // Transitioning toward projects
      lookAt: [0, 0, 0],
      rotationSpeed: 1.2,
      floatIntensity: 0.4,
    },
    easing: (t) => {
      // Smooth ease-in-out
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },
  },
  projects: {
    entry: {
      // Station at (0, 0.5, 10) - Camera offset left side
      position: [-5, 1, 8],  // Left offset for variety
      lookAt: [0, 0, 0],
      rotationSpeed: 1.2,
      floatIntensity: 0.4,
    },
    exit: {
      position: [-7, 1.5, 6],  // Transitioning toward skills
      lookAt: [0, 0, 0],
      rotationSpeed: 1.4,
      floatIntensity: 0.3,
    },
    easing: (t) => {
      // Cubic ease-out for smooth deceleration
      return 1 - Math.pow(1 - t, 3);
    },
  },
  skills: {
    entry: {
      // Station at (-10, 1.5, 0) - Camera offset right side
      position: [-8, 2, 5],  // Right offset, elevated view
      lookAt: [0, 0, 0],
      rotationSpeed: 1.4,
      floatIntensity: 0.3,
    },
    exit: {
      position: [-6, 1.75, 3],  // Transitioning toward contact
      lookAt: [0, 0, 0],
      rotationSpeed: 1.6,
      floatIntensity: 0.25,
    },
    easing: (t) => {
      // Quartic ease-in-out for dramatic orbit
      return t < 0.5
        ? 8 * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 4) / 2;
    },
  },
  contact: {
    entry: {
      // Station at (0, 0, -10) - Camera offset left side
      position: [5, 1, -8],  // Left offset for final section
      lookAt: [0, 0, 0],
      rotationSpeed: 1.6,
      floatIntensity: 0.25,
    },
    exit: {
      position: [7, 1.25, -6],  // Completing orbit back to home
      lookAt: [0, 0, 0],
      rotationSpeed: 1.3,
      floatIntensity: 0.4,
    },
    easing: (t) => {
      // Smooth ease for completion
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },
  },
};

export default function ChoreographedGeometry({
  scrollProgress,
  activeSection,
  sectionProgress,
  projects = [],
  onProjectClick,
  focusedProject,
  onProjectFocus,
  resetTrigger,
}: ChoreographedGeometryProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const [cameraLerpSpeed] = useState(0.05); // Smooth camera movement
  const [floatIntensity, setFloatIntensity] = useState(0.5);
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentRotationSpeed = useRef(1.0);

  // Check if we're in a project section
  const isProjectSection = activeSection.startsWith('project-');

  useFrame((state) => {
    if (!meshRef.current) return;

    // Only apply camera choreography for non-project sections
    // Project sections handled by CinematicShowcase
    if (!isProjectSection) {
      // SCROLL MODE: Normal choreographed camera movement
      const choreography = CAMERA_CHOREOGRAPHY[activeSection] || CAMERA_CHOREOGRAPHY.home;
      const easing = choreography.easing || ((t: number) => t);
      
      // Apply easing to section progress
      const easedProgress = easing(sectionProgress);

      // Interpolate between entry and exit waypoints
      const lerpPosition = (axis: number) => {
        return THREE.MathUtils.lerp(
          choreography.entry.position[axis],
          choreography.exit.position[axis],
          easedProgress
        );
      };

      const lerpLookAt = (axis: number) => {
        return THREE.MathUtils.lerp(
          choreography.entry.lookAt[axis],
          choreography.exit.lookAt[axis],
          easedProgress
        );
      };

      // Calculate target camera position for this frame
      targetCameraPos.current.set(
        lerpPosition(0),
        lerpPosition(1),
        lerpPosition(2)
      );

      // Calculate target lookAt for this frame
      targetLookAt.current.set(
        lerpLookAt(0),
        lerpLookAt(1),
        lerpLookAt(2)
      );

      // Interpolate rotation speed
      currentRotationSpeed.current = THREE.MathUtils.lerp(
        choreography.entry.rotationSpeed,
        choreography.exit.rotationSpeed,
        easedProgress
      );

      // Interpolate float intensity and update state
      const targetFloatIntensity = THREE.MathUtils.lerp(
        choreography.entry.floatIntensity,
        choreography.exit.floatIntensity,
        easedProgress
      );
      setFloatIntensity(targetFloatIntensity);

      // Smooth camera movement with lerp for 60 FPS fluidity
      const lerpFactor = 0.05; // Lower = smoother but slower response
      camera.position.lerp(targetCameraPos.current, lerpFactor);
      camera.lookAt(targetLookAt.current);
    }

    // Dynamic rotation based on current speed
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 * currentRotationSpeed.current;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;

    // Add subtle pulsing effect in contact section
    if (meshRef.current) {
      // Gentle continuous rotation
      meshRef.current.rotation.y += 0.001 * state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

      // Pulsing scale for visual interest
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1;
      const targetScale = 1.0;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
      
      // Pulsing glow effect - ONLY active on home/About Me section
      const isHome = activeSection === 'home';
      if (isHome) {
        const pulseSpeed = 1.5;
        const pulseIntensity = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.6 + 1.2; // Range: 0.6 to 1.8
        
        // Update material emissive intensity for main mesh
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
          meshRef.current.material.emissiveIntensity = pulseIntensity;
        }
        
        // Update glow shell
        if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
          glowRef.current.material.opacity = 0.2 + pulseIntensity * 0.15;
          glowRef.current.rotation.y = meshRef.current.rotation.y;
          glowRef.current.rotation.x = meshRef.current.rotation.x;
        }
      } else {
        // Fade out glow when not on home section
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
          meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
            meshRef.current.material.emissiveIntensity,
            0.3,
            0.05
          );
        }
        if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
          glowRef.current.material.opacity = THREE.MathUtils.lerp(
            glowRef.current.material.opacity,
            0,
            0.05
          );
        }
      }
    }
  });

  // Navigate to section by scrolling
  const navigateToSection = (sectionName: string) => {
    const vh = window.innerHeight;
    const sectionMap: Record<string, number> = {
      home: 0,
      projects: vh,
      skills: vh * 2,
      contact: vh * 3,
    };
    
    window.scrollTo({
      top: sectionMap[sectionName] || 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Spatial Instructions - Exist in 3D Space */}
      <SpatialInstructions 
        activeSection={activeSection}
        focusedProject={focusedProject !== null && focusedProject !== undefined}
      />

      {/* Ambient Geometry - Unique 3D elements per section */}
      <AmbientGeometry
        activeSection={activeSection}
        sectionProgress={sectionProgress}
      />

      {/* Cinematic Project Showcase - Each project gets center stage */}
      {projects.length > 0 && (
        <CinematicShowcase
          projects={projects}
          activeSection={activeSection}
          sectionProgress={sectionProgress}
          onProjectClick={onProjectClick}
        />
      )}

      {/* Central Octahedron - The Anchor with Pulsing Glow */}
      <Float
        speed={1.5}
        rotationIntensity={0.3}
        floatIntensity={floatIntensity}
      >
        {/* Main octahedron with emissive glow */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[3, 0]} />
          <meshStandardMaterial 
            color="#0891B2"
            wireframe
            wireframeLinewidth={2}
            emissive="#0891B2"
            emissiveIntensity={1.2}
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Outer glow shell for enhanced pulsing effect */}
        <mesh ref={glowRef} scale={1.25}>
          <octahedronGeometry args={[3, 0]} />
          <meshBasicMaterial
            color="#0891B2"
            wireframe
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      
      {/* Add ambient particles that follow camera */}
      {activeSection === 'skills' && (
        <group>
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const radius = 5 + Math.sin(i * 0.5) * 1;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(i * 0.3) * 3,
                  Math.sin(angle) * radius,
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
      </Float>
    </>
  );
}
