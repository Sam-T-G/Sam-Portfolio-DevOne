"use client";
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SpatialInstructionsProps {
  activeSection: string;
  focusedProject: boolean;
}

export default function SpatialInstructions({
  activeSection,
  focusedProject,
}: SpatialInstructionsProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [opacity, setOpacity] = useState(0);

  useFrame(() => {
    if (!groupRef.current) return;

    // Only show in projects section
    const isProjectsSection = activeSection === 'projects';
    const targetOpacity = isProjectsSection && !focusedProject ? 1 : 0;
    
    // Smooth fade
    setOpacity(prevOpacity => THREE.MathUtils.lerp(
      prevOpacity,
      targetOpacity,
      0.05
    ));

    // Gentle floating animation
    if (isProjectsSection) {
      const time = performance.now() * 0.001;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  if (opacity < 0.01) return null;

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Title */}
      <Html
        transform
        distanceFactor={10}
        position={[0, 2, 0]}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: opacity,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '600px',
          marginLeft: '-300px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.15)',
            margin: 0,
            padding: 0,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          }}>
            Selected Work
          </h2>
        </div>
      </Html>

      {/* Instructions Row */}
      <Html
        transform
        distanceFactor={10}
        position={[0, 0.5, 0]}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: opacity * 0.8,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '48px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '800px',
          marginLeft: '-400px',
        }}>
          {/* Hover instruction */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '600',
              background: 'rgba(0, 0, 0, 0.2)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
            }}>
              1
            </div>
            <span style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)',
            }}>
              Hover
            </span>
          </div>

          {/* Focus instruction */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '600',
              background: 'rgba(0, 0, 0, 0.2)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
            }}>
              2
            </div>
            <span style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)',
            }}>
              Click to Focus
            </span>
          </div>

          {/* Visit instruction */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '600',
              background: 'rgba(0, 0, 0, 0.2)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
            }}>
              3
            </div>
            <span style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)',
            }}>
              Click to Visit
            </span>
          </div>
        </div>
      </Html>

      {/* ESC hint */}
      <Html
        transform
        distanceFactor={10}
        position={[0, -1, 0]}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: opacity * 0.6,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '400px',
          marginLeft: '-200px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.3)',
            fontWeight: '500',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)',
          }}>
            Press ESC to Release Focus
          </h2>
        </div>
      </Html>
    </group>
  );
}
