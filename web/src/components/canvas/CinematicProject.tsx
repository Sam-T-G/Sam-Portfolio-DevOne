"use client";
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
  description?: string;
  tags?: string[];
  hackathon?: string;
}

interface CinematicProjectProps {
  project: Project;
  isActive: boolean;
  transitionProgress: number; // 0-1, how far into this project's section
  position: [number, number, number];
  onInteract?: () => void;
}

// World-class geometry selection based on project index
const SIGNATURE_GEOMETRIES = [
  { type: 'icosahedron', args: [1.2, 1], complexity: 'high' },
  { type: 'dodecahedron', args: [1.1, 0], complexity: 'very-high' },
  { type: 'octahedron', args: [1.3, 2], complexity: 'medium' },
  { type: 'tetrahedron', args: [1.4, 0], complexity: 'low' },
];

export default function CinematicProject({
  project,
  isActive,
  transitionProgress,
  position,
  onInteract,
}: CinematicProjectProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Responsive positioning for panel
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Select geometry based on project ID for consistency
  const geometry = useMemo(() => {
    return SIGNATURE_GEOMETRIES[(project.id - 1) % SIGNATURE_GEOMETRIES.length];
  }, [project.id]);

  // Particle field around project - seeded random for consistency
  const particles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color(project.color);

    // Seeded random generator for consistent particle placement
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      // Spherical distribution with seeded random
      const seed1 = project.id * 1000 + i;
      const seed2 = project.id * 2000 + i;
      const seed3 = project.id * 3000 + i;

      const radius = 3 + seededRandom(seed1) * 2;
      const theta = seededRandom(seed2) * Math.PI * 2;
      const phi = Math.acos(2 * seededRandom(seed3) - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [project.color, project.id]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Active state: gentle rotation and breathing
    if (isActive) {
      // Smooth rotation - signature movement
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.3;
      meshRef.current.rotation.y = time * 0.15;
      meshRef.current.rotation.z = Math.cos(time * 0.25) * 0.2;

      // Breathing scale based on transition progress
      const breathe = 1 + Math.sin(time * 0.8) * 0.05;
      const enterScale = THREE.MathUtils.lerp(0.5, 1, Math.min(transitionProgress * 2, 1));
      meshRef.current.scale.setScalar(enterScale * breathe);

      // Glow breathing
      if (glowRef.current) {
        const glowBreath = 1.5 + Math.sin(time * 0.9) * 0.3;
        glowRef.current.scale.setScalar(enterScale * glowBreath);
      }

      // Particle rotation
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.1;
        particlesRef.current.rotation.x = Math.sin(time * 0.15) * 0.2;
      }
    } else {
      // Inactive state: slow idle rotation, smaller scale
      meshRef.current.rotation.y = time * 0.05;
      const idleScale = THREE.MathUtils.lerp(meshRef.current.scale.x, 0.3, 0.05);
      meshRef.current.scale.setScalar(idleScale);

      if (glowRef.current) {
        const glowScale = THREE.MathUtils.lerp(glowRef.current.scale.x, 0.5, 0.05);
        glowRef.current.scale.setScalar(glowScale);
      }
    }
  });

  const GeometryComponent = geometry.type as 'icosahedron' | 'dodecahedron' | 'octahedron' | 'tetrahedron';

  return (
    <group position={position}>
      {/* Particle field - ambient context */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={isActive ? 0.6 : 0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Main project polyhedron */}
      <mesh ref={meshRef} onClick={onInteract}>
        {GeometryComponent === 'icosahedron' && (
          <icosahedronGeometry args={geometry.args as [number, number]} />
        )}
        {GeometryComponent === 'dodecahedron' && (
          <dodecahedronGeometry args={geometry.args as [number, number]} />
        )}
        {GeometryComponent === 'octahedron' && (
          <octahedronGeometry args={geometry.args as [number, number]} />
        )}
        {GeometryComponent === 'tetrahedron' && (
          <tetrahedronGeometry args={geometry.args as [number, number]} />
        )}
        <meshStandardMaterial
          color={project.color}
          wireframe
          wireframeLinewidth={2}
          emissive={project.color}
          emissiveIntensity={isActive ? 1.5 : 0.5}
          transparent
          opacity={isActive ? 1 : 0.4}
        />
      </mesh>

      {/* Outer glow shell */}
      <mesh ref={glowRef} scale={1.5}>
        {GeometryComponent === 'icosahedron' && (
          <icosahedronGeometry args={geometry.args as [number, number]} />
        )}
        {GeometryComponent === 'dodecahedron' && (
          <dodecahedronGeometry args={geometry.args as [number, number]} />
        )}
        {GeometryComponent === 'octahedron' && (
          <octahedronGeometry args={geometry.args as [number, number]} />
        )}
        {GeometryComponent === 'tetrahedron' && (
          <tetrahedronGeometry args={geometry.args as [number, number]} />
        )}
        <meshBasicMaterial
          color={project.color}
          wireframe
          transparent
          opacity={isActive ? 0.25 : 0.08}
        />
      </mesh>

      {/* Intense point light for drama */}
      <pointLight
        color={project.color}
        intensity={isActive ? 4 : 0.8}
        distance={12}
        decay={2}
      />

      {/* Project information card - only when active */}
      {isActive && (
        <Html
          key={`panel-${isMobile ? 'mobile' : 'desktop'}`}
          position={[0, -1.2, 0]}
          center={!isMobile}
          distanceFactor={isMobile ? 8 : 6}
          zIndexRange={[100, 0]}
          style={{
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 1,
            transform: isMobile ? 'translateX(-50%)' : 'scale(1)',
            pointerEvents: 'auto',
            left: isMobile ? '50%' : 'auto',
          }}
        >
          <div
            onClick={project.link ? () => window.open(project.link, '_blank') : undefined}
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #000000f0, #0a0a0ae8)',
              backdropFilter: 'blur(24px)',
              border: `4px solid ${project.color}`,
              borderRadius: '10px',
              padding: isMobile ? '24px 20px' : '32px 40px',
              minWidth: isMobile ? 'auto' : '480px',
              maxWidth: isMobile ? '90vw' : '780px',
              width: isMobile ? '90vw' : 'auto',
              boxShadow: `0 0 80px ${project.color}90, inset 0 0 40px ${project.color}25, 0 8px 30px #00000090`,
              fontFamily: '"Courier New", monospace',
              animation: 'borderPulse 2s ease-in-out infinite, slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: project.link ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              margin: isMobile ? '0 auto' : '0',
            }}
            onMouseEnter={(e) => {
              if (project.link) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = `0 0 100px ${project.color}, inset 0 0 50px ${project.color}30, 0 12px 40px #000000a0`;
              }
            }}
            onMouseLeave={(e) => {
              if (project.link) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 0 80px ${project.color}90, inset 0 0 40px ${project.color}25, 0 8px 30px #00000090`;
              }
            }}
          >
            <style>{`
              @keyframes borderPulse {
                0%, 100% {
                  box-shadow: 0 0 60px ${project.color}80, inset 0 0 30px ${project.color}20;
                }
                50% {
                  box-shadow: 0 0 80px ${project.color}a0, inset 0 0 40px ${project.color}30;
                }
              }
              
              @keyframes slideInUp {
                0% {
                  opacity: 0;
                  transform: translateY(30px) scale(0.95);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              
              @media (max-width: 768px) {
                div[style*="minWidth"] {
                  min-width: auto !important;
                  max-width: 90vw !important;
                  width: 90vw !important;
                  padding: 24px 20px !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                }
              }
              
              @media (min-width: 769px) and (max-width: 1024px) {
                div[style*="minWidth: '480px'"] {
                  /* No margin override - let 3D positioning handle it */
                }
              }
              
              @media (min-height: 900px) {
                /* On tall screens, ensure panel is visible */
                div[style*="minWidth: '480px'"] {
                  margin-top: 2rem;
                  margin-bottom: 2rem;
                }
              }
            `}</style>

            {/* Corner accents */}
            <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '28px', height: '28px', borderTop: `5px solid ${project.color}`, borderLeft: `5px solid ${project.color}` }} />
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '28px', height: '28px', borderTop: `5px solid ${project.color}`, borderRight: `5px solid ${project.color}` }} />
            <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '28px', height: '28px', borderBottom: `5px solid ${project.color}`, borderLeft: `5px solid ${project.color}` }} />
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderBottom: `5px solid ${project.color}`, borderRight: `5px solid ${project.color}` }} />

            {/* Project number badge */}
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '28px',
                background: project.color,
                color: '#000000',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '2.5px',
                borderRadius: '3px',
                boxShadow: `0 0 25px ${project.color}, 0 4px 15px ${project.color}80`,
              }}
            >
              PROJECT {String(project.id).padStart(2, '0')}
            </div>

            {/* Title */}
            <h2
              style={{
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '10px 0 14px 0',
                letterSpacing: '3.5px',
                textTransform: 'uppercase',
                textShadow: `0 0 25px ${project.color}70, 0 2px 10px #000000`,
              }}
            >
              {project.title}
            </h2>

            {/* Subtitle */}
            <p
              style={{
                color: project.color,
                fontSize: '15px',
                margin: '0 0 18px 0',
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                opacity: 1,
                textShadow: `0 0 15px ${project.color}40`,
              }}
            >
              {project.subtitle}
            </p>

            {/* Hackathon Badge */}
            {project.hackathon && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: `linear-gradient(135deg, ${project.color}30, ${project.color}15)`,
                  border: `2px solid ${project.color}`,
                  borderRadius: '6px',
                  padding: '8px 16px',
                  marginBottom: '16px',
                  boxShadow: `0 0 20px ${project.color}40, inset 0 0 15px ${project.color}10`,
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    textShadow: `0 0 10px ${project.color}60`,
                  }}
                >
                  {project.hackathon}
                </span>
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
                margin: '16px 0',
              }}
            />

            {/* Description if available */}
            {project.description && (
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  margin: '0 0 20px 0',
                  opacity: 0.95,
                  fontWeight: '500',
                  textShadow: '0 1px 3px #000000',
                }}
              >
                {project.description}
              </p>
            )}

            {/* Tags if available */}
            {project.tags && project.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      color: '#ffffff',
                      background: `${project.color}25`,
                      border: `2px solid ${project.color}80`,
                      padding: '6px 12px',
                      fontSize: '11px',
                      letterSpacing: '1.2px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                      opacity: 1,
                      boxShadow: `0 0 10px ${project.color}30, inset 0 0 8px ${project.color}15`,
                      textShadow: `0 1px 2px #000000`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action hint */}
            {project.link && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: `2px solid ${project.color}60`,
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: project.color,
                    boxShadow: `0 0 15px ${project.color}, 0 0 5px ${project.color}`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <span style={{ opacity: 0.9, textShadow: `0 0 10px ${project.color}40` }}>CLICK ANYWHERE TO VIEW PROJECT</span>
              </div>
            )}

            {/* Scan line effect */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
                animation: 'scanLine 3s linear infinite',
                top: 0,
                opacity: 0.8,
              }}
            />
            <style>{`
              @keyframes scanLine {
                0% { top: 0; opacity: 0.8; }
                100% { top: 100%; opacity: 0; }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            `}</style>

            {/* Noise overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff02 2px, #ffffff02 4px)',
                pointerEvents: 'none',
                opacity: 0.3,
                borderRadius: '8px',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
}
