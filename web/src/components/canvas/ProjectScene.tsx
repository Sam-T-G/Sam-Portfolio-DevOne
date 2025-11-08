"use client";
import { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import ProjectCard3D from './ProjectCard3D';
import CameraController from './CameraController';
import Loader3D from './Loader3D';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
}

interface ProjectSceneProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export default function ProjectScene({ projects, onProjectClick }: ProjectSceneProps) {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  // Keyboard support - ESC to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeProject !== null) {
        setActiveProject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject]);

  // Calculate positions in a circular arc layout
  const projectPositions = useMemo(() => {
    const radius = 6;
    const angleStep = (Math.PI * 0.8) / (projects.length - 1); // 144 degree arc
    const startAngle = -Math.PI * 0.4; // Start from left

    return projects.map((_, index) => {
      const angle = startAngle + angleStep * index;
      return [
        Math.sin(angle) * radius,
        Math.cos(angle) * 0.5 - 1, // Slight vertical arc
        Math.cos(angle) * radius - radius,
      ] as [number, number, number];
    });
  }, [projects]);

  const handleCardClick = (index: number) => {
    // If card is already active, open the link (second click)
    if (activeProject === index) {
      if (onProjectClick) {
        onProjectClick(projects[index]);
      }
      return;
    }
    
    // First click: just focus the card
    setActiveProject(index);
  };

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ touchAction: 'none' }}
      >
        {/* Lighting Setup - Cinematic */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0891B2" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Camera Setup */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 2, 12]} 
          fov={50}
        />

        {/* Camera Controller for GSAP Transitions */}
        <CameraController
          activeProject={activeProject}
          projectPositions={projectPositions}
        />

        {/* Atmosphere */}
        <Suspense fallback={null}>
          <Stars
            radius={100}
            depth={50}
            count={2000}
            factor={3}
            saturation={0}
            fade
            speed={0.5}
          />
        </Suspense>

        {/* Contact Shadows for Realism */}
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.5}
          scale={30}
          blur={2}
          far={4}
        />

        {/* Project Cards in Circular Layout */}
        <Suspense fallback={<Loader3D />}>
          {projects.map((project, index) => (
            <ProjectCard3D
              key={project.id}
              position={projectPositions[index]}
              title={project.title}
              subtitle={project.subtitle}
              color={project.color}
              index={index}
              isActive={activeProject === index}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </Suspense>

        {/* Ambient Particles / Fog */}
        <fog attach="fog" args={['#f5f5f5', 15, 30]} />

        {/* Ground Plane for Depth */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -3, 0]} 
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color="#f0f0f0"
            roughness={1}
            metalness={0}
          />
        </mesh>
      </Canvas>

      {/* Navigation UI Overlay */}
      {activeProject !== null && (
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-fade-in">
          <button
            onClick={() => setActiveProject(null)}
            className="group rounded-full bg-[var(--accent-teal)] px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_50px_rgba(8,145,178,0.5)] active:scale-95"
          >
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Overview
            </span>
          </button>
          <p className="mt-3 text-center text-xs text-[var(--charcoal)] opacity-70">
            or press ESC
          </p>
        </div>
      )}

      {/* Project Counter & Instructions */}
      <div className="pointer-events-none absolute top-8 right-8 text-right">
        <div className="rounded-lg bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-bold text-[var(--ink-black)]">
            {activeProject !== null
              ? `Project ${activeProject + 1} / ${projects.length}`
              : `${projects.length} Projects`}
          </p>
          {activeProject === null && (
            <p className="mt-1 text-xs text-[var(--charcoal)]">
              Click to explore
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
