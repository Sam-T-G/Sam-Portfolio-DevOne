"use client";
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import CinematicProject from './CinematicProject';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
  description?: string;
  mobileDescription?: string;
  tags?: string[];
  hackathon?: string;
}

interface CinematicShowcaseProps {
  projects: Project[];
  activeSection: string;
  sectionProgress: number;
  onProjectClick?: (project: Project) => void;
}

export default function CinematicShowcase({
  projects,
  activeSection,
  sectionProgress,
  onProjectClick,
}: CinematicShowcaseProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  
  // Responsive positioning
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Determine which project is active based on section
  const activeProjectIndex = activeSection.startsWith('project-')
    ? parseInt(activeSection.split('-')[1])
    : -1;

  // Calculate positions for all projects - arranged vertically with spacing
  const projectPositions: [number, number, number][] = projects.map((_, index) => {
    // Projects are positioned along the Y axis with generous spacing
    const spacing = 12;
    const yPos = index * spacing;
    
    // All projects centered at origin on X and Z
    return [0, yPos, 0];
  });

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth camera movement to active project
    if (activeProjectIndex >= 0 && activeProjectIndex < projects.length) {
      const targetPos = projectPositions[activeProjectIndex];
      const [, targetY] = targetPos;

      // Calculate camera position based on viewport size
      const cameraDistance = isMobile ? 6 : 5;
      const cameraHeight = isMobile ? 1.5 : 2;
      
      const targetCameraPos = new THREE.Vector3(
        0,  // Centered on X
        targetY + cameraHeight,  // Slightly above project
        cameraDistance  // Forward from project
      );

      const targetLookAt = new THREE.Vector3(0, targetY, 0);

      // Smooth interpolation
      camera.position.lerp(targetCameraPos, 0.06);
      
      // Smooth lookAt
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(10).add(camera.position);
      currentLookAt.lerp(targetLookAt, 0.06);
      camera.lookAt(currentLookAt);
    }
  });

  return (
    <group ref={groupRef}>
      {projects.map((project, index) => {
        const isActive = activeProjectIndex === index;
        
        return (
          <CinematicProject
            key={project.id}
            project={project}
            isActive={isActive}
            transitionProgress={isActive ? sectionProgress : 0}
            position={projectPositions[index]}
            onInteract={() => {
              if (project.link && onProjectClick) {
                onProjectClick(project);
              }
            }}
          />
        );
      })}
    </group>
  );
}
