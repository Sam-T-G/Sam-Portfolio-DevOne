"use client";
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import ProjectConstellation from './ProjectConstellation';
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

// Define camera choreography for each section
const CAMERA_CHOREOGRAPHY: Record<string, {
  entry: CameraWaypoint;
  exit: CameraWaypoint;
  easing?: (t: number) => number;
}> = {
  hero: {
    entry: {
      position: [0, 0, 5],
      lookAt: [0, 0, 0],
      rotationSpeed: 1.0,
      floatIntensity: 0.5,
    },
    exit: {
      position: [2, 0.5, 3.5],  // Move to center-right, closer
      lookAt: [0.5, 0.2, 0],
      rotationSpeed: 1.5,
      floatIntensity: 0.25,
    },
    easing: (t) => {
      // Smooth ease-in-out
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },
  },
  projects: {
    entry: {
      position: [2, 0.5, 3.5],  // Start from hero exit
      lookAt: [0.5, 0.2, 0],
      rotationSpeed: 1.5,
      floatIntensity: 0.25,
    },
    exit: {
      position: [-2.5, 1, 4],  // Swing to left, slightly higher
      lookAt: [-0.8, 0.3, 0],
      rotationSpeed: 1.8,
      floatIntensity: 0.15,
    },
    easing: (t) => {
      // Cubic ease-out for smooth deceleration
      return 1 - Math.pow(1 - t, 3);
    },
  },
  skills: {
    entry: {
      position: [-2.5, 1, 4],  // Start from projects exit
      lookAt: [-0.8, 0.3, 0],
      rotationSpeed: 1.8,
      floatIntensity: 0.15,
    },
    exit: {
      position: [0, 3, 5],  // Move to top, centered perspective
      lookAt: [0, -0.5, 0],
      rotationSpeed: 2.0,
      floatIntensity: 0.1,
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
      position: [0, 3, 5],  // Start from skills exit
      lookAt: [0, -0.5, 0],
      rotationSpeed: 2.0,
      floatIntensity: 0.1,
    },
    exit: {
      position: [0, 0, 4],  // Return to front-facing, slightly closer
      lookAt: [0, 0, 0],
      rotationSpeed: 1.2,
      floatIntensity: 0.3,
    },
    easing: (t) => {
      // Bounce ease-out for playful ending
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
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
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const focusCameraPos = useRef(new THREE.Vector3());
  const focusLookAt = useRef(new THREE.Vector3());
  const currentRotationSpeed = useRef(1.0);
  const [floatIntensity, setFloatIntensity] = useState(0.5);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Check if we're in focus mode
    if (focusedProject) {
      // FOCUS MODE: Camera looks at selected polyhedron
      const [x, y, z] = focusedProject.position;
      
      // Calculate tasteful off-center camera position
      // Position camera closer and to the side for dramatic view
      const cameraOffset = new THREE.Vector3(
        x + 2.5,  // Offset to the right
        y + 1.5,  // Slightly above
        z + 3.5   // Closer to viewer
      );
      
      focusCameraPos.current.copy(cameraOffset);
      focusLookAt.current.set(x, y, z);
      
      // Smooth transition to focus position
      camera.position.lerp(focusCameraPos.current, 0.08);
      
      // Create a smooth lookAt with slight damping
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(10).add(camera.position);
      currentLookAt.lerp(focusLookAt.current, 0.08);
      camera.lookAt(currentLookAt);
      
    } else {
      // SCROLL MODE: Normal choreographed camera movement
      const choreography = CAMERA_CHOREOGRAPHY[activeSection] || CAMERA_CHOREOGRAPHY.hero;
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
    if (activeSection === 'contact') {
      const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      meshRef.current.scale.setScalar(1 + pulse);
    } else {
      // Smoothly return to normal scale
      const currentScale = meshRef.current.scale.x;
      const targetScale = 1.0;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, targetScale, 0.1)
      );
    }
  });

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

      {/* Project Constellation - Elegant Geometric System */}
      {projects.length > 0 && (
        <ProjectConstellation
          projects={projects}
          activeSection={activeSection}
          sectionProgress={sectionProgress}
          onProjectClick={onProjectClick}
          focusedProjectId={focusedProject?.project.id || null}
          onProjectFocus={onProjectFocus}
          resetTrigger={resetTrigger}
        />
      )}

      {/* Central Octahedron - The Anchor */}
      <Float
        speed={1.5}
        rotationIntensity={0.3}
        floatIntensity={floatIntensity}
      >
      <mesh ref={meshRef}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial 
          color="#0891B2"
          wireframe
          wireframeLinewidth={2}
          emissive="#0891B2"
          emissiveIntensity={Math.min(scrollProgress * 0.3, 0.3)}
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
