"use client";
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface AmbientGeometryProps {
  activeSection: string;
  sectionProgress: number;
}

export default function AmbientGeometry({ activeSection, sectionProgress }: AmbientGeometryProps) {
  const homeElementsRef = useRef<THREE.Group>(null!);
  const skillsElementsRef = useRef<THREE.Group>(null!);
  const contactElementsRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    // Smooth opacity transitions for each section's elements
    if (homeElementsRef.current) {
      const targetOpacity = activeSection === 'home' ? 1 : 0;
      homeElementsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = THREE.MathUtils.lerp(
            child.material.opacity,
            targetOpacity,
            0.03
          );
        }
      });
    }

    if (skillsElementsRef.current) {
      const targetOpacity = activeSection === 'skills' ? 1 : 0;
      skillsElementsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = THREE.MathUtils.lerp(
            child.material.opacity,
            targetOpacity,
            0.03
          );
        }
      });
    }

    if (contactElementsRef.current) {
      const targetOpacity = activeSection === 'contact' ? 1 : 0;
      contactElementsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = THREE.MathUtils.lerp(
            child.material.opacity,
            targetOpacity,
            0.03
          );
        }
      });
    }
  });

  return (
    <>
      {/* Home Section - Floating Geometric Shapes */}
      <group ref={homeElementsRef}>
        <Float
          speed={1.2}
          rotationIntensity={0.3}
          floatIntensity={0.4}
        >
          <mesh position={[-8, 2, -5]}>
            <torusGeometry args={[0.8, 0.3, 16, 32]} />
            <meshStandardMaterial
              color="#0891B2"
              transparent
              opacity={0}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        </Float>

        <Float
          speed={0.8}
          rotationIntensity={0.2}
          floatIntensity={0.3}
        >
          <mesh position={[7, -1, -8]}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial
              color="#10B981"
              transparent
              opacity={0}
              metalness={0.2}
              roughness={0.5}
            />
          </mesh>
        </Float>

        <Float
          speed={1.5}
          rotationIntensity={0.4}
          floatIntensity={0.5}
        >
          <mesh position={[-6, -2, -6]}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial
              color="#F59E0B"
              transparent
              opacity={0}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        </Float>
      </group>

      {/* Skills Section - Technical Grid Elements */}
      <group ref={skillsElementsRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 12;
          return (
            <Float
              key={`skill-${i}`}
              speed={0.5 + i * 0.1}
              rotationIntensity={0.2}
              floatIntensity={0.2}
            >
              <mesh
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(i * 0.5) * 2,
                  Math.sin(angle) * radius
                ]}
              >
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#0891B2" : "#10B981"}
                  transparent
                  opacity={0}
                  metalness={0.5}
                  roughness={0.2}
                  wireframe
                />
              </mesh>
            </Float>
          );
        })}
      </group>

      {/* Contact Section - Connecting Nodes */}
      <group ref={contactElementsRef}>
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 10;
          return (
            <Float
              key={`contact-${i}`}
              speed={0.6 + i * 0.08}
              rotationIntensity={0.15}
              floatIntensity={0.25}
            >
              <mesh
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(i * 0.8) * 1.5,
                  Math.sin(angle) * radius
                ]}
              >
                <icosahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                  color="#F59E0B"
                  transparent
                  opacity={0}
                  metalness={0.3}
                  roughness={0.4}
                  emissive="#F59E0B"
                  emissiveIntensity={0.2}
                />
              </mesh>
            </Float>
          );
        })}
      </group>
    </>
  );
}
