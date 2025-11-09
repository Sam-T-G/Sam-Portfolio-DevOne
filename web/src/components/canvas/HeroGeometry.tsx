"use client";
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface HeroGeometryProps {
  scrollProgress?: number;
}

export default function HeroGeometry({ scrollProgress = 0 }: HeroGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle rotation based on time
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;

    // Pulsing glow effect - stronger when on About Me page (scrollProgress near 0)
    const pulseSpeed = 1.5; // Speed of the pulse
    const pulseIntensity = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.5 + 1; // Range: 0.5 to 1.5
    
    // Fade out glow as user scrolls away from About Me
    const glowFade = 1 - Math.min(scrollProgress * 2, 1); // Fade out in first 50% of scroll
    const finalIntensity = pulseIntensity * glowFade;
    
    // Update material emissive intensity
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = finalIntensity;
    }
    
    // Update glow shell opacity
    if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = (0.15 + pulseIntensity * 0.1) * glowFade;
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      glowRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }

    // Scroll parallax effect - move camera towards center-right
    // As scroll increases (0 to 1), camera moves from initial position to closer, offset position
    const scrollFactor = Math.min(scrollProgress, 1); // Clamp to 0-1
    
    // Target position: closer and to the center-right
    const targetX = THREE.MathUtils.lerp(0, 1.5, scrollFactor);      // Move right
    const targetY = THREE.MathUtils.lerp(0, 0.3, scrollFactor);      // Move slightly up
    const targetZ = THREE.MathUtils.lerp(5, 3, scrollFactor);        // Move closer
    
    // Smooth camera movement using .set() to avoid mutation errors
    const newX = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    const newY = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    const newZ = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.set(newX, newY, newZ);
    
    // Look at point shifts slightly to center-right of object
    const lookAtX = THREE.MathUtils.lerp(0, 0.5, scrollFactor);
    const lookAtY = THREE.MathUtils.lerp(0, 0.2, scrollFactor);
    targetLookAt.current.set(lookAtX, lookAtY, 0);
    
    camera.lookAt(targetLookAt.current);
    
    // Add subtle rotation speed change based on scroll
    const rotationMultiplier = 1 + (scrollFactor * 0.5); // Speed up slightly as user scrolls
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 * rotationMultiplier;
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={scrollProgress > 0.5 ? 0.15 : 0.3}
      floatIntensity={scrollProgress > 0.5 ? 0.25 : 0.5}
    >
      {/* Main octahedron with pulsing emissive glow */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial 
          color="#0891B2"
          wireframe
          wireframeLinewidth={2}
          emissive="#0891B2"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Outer glow shell - pulsing effect */}
      <mesh ref={glowRef} scale={1.2}>
        <octahedronGeometry args={[3, 0]} />
        <meshBasicMaterial
          color="#0891B2"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}
