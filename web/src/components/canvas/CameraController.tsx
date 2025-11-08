"use client";
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface CameraControllerProps {
  activeProject: number | null;
  projectPositions: [number, number, number][];
}

export default function CameraController({ 
  activeProject, 
  projectPositions 
}: CameraControllerProps) {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;
    
    isAnimating.current = true;

    if (activeProject !== null && projectPositions[activeProject]) {
      // Focus on specific project
      const targetPos = projectPositions[activeProject];
      const focusPosition = {
        x: targetPos[0],
        y: targetPos[1],
        z: targetPos[2] + 4, // Move camera closer to the card
      };

      // Animate camera position
      gsap.to(camera.position, {
        x: focusPosition.x,
        y: focusPosition.y + 0.5,
        z: focusPosition.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          lookAtTarget.current.set(targetPos[0], targetPos[1], targetPos[2]);
        },
        onComplete: () => {
          isAnimating.current = false;
        }
      });

      // Animate lookAt target
      gsap.to(lookAtTarget.current, {
        x: targetPos[0],
        y: targetPos[1],
        z: targetPos[2],
        duration: 1.8,
        ease: 'power3.inOut',
      });

    } else {
      // Return to overview position
      gsap.to(camera.position, {
        x: 0,
        y: 2,
        z: 12,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          lookAtTarget.current.set(0, 0, 0);
        },
        onComplete: () => {
          isAnimating.current = false;
        }
      });

      gsap.to(lookAtTarget.current, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2.0,
        ease: 'power2.inOut',
      });
    }
  }, [activeProject, camera, projectPositions]);

  // Update camera lookAt every frame
  useFrame(() => {
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
