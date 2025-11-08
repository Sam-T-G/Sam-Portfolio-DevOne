"use client";
import { useEffect, useState } from 'react';

interface GameHUDProps {
  targetName: string;
  targetType: 'project' | 'section' | 'centerpiece';
  subtitle?: string;
  description?: string;
  status?: string;
  distance?: number;
  coordinates?: { x: number; y: number; z: number };
  metadata?: Record<string, string | number>;
  actionHint?: string;
  color?: string;
  visible: boolean;
  position?: { x: number; y: number };
  expanded?: boolean;
  onExpand?: () => void;
}

export default function GameHUD({
  targetName,
  targetType,
  subtitle,
  description,
  status = 'ACTIVE',
  distance,
  coordinates,
  metadata,
  actionHint = 'CLICK TO INTERACT',
  color = '#0891B2',
  visible,
  position = { x: 0, y: 0 },
  expanded = false,
  onExpand,
}: GameHUDProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [glitchText, setGlitchText] = useState(targetName);

  // Scanning animation
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [visible]);

  // Glitch effect on name
  useEffect(() => {
    if (!visible) return;
    
    const glitchChars = '!@#$%^&*()_+{}[]|;:<>?/~`';
    const originalName = targetName;
    
    const glitch = () => {
      const shouldGlitch = Math.random() > 0.95;
      if (shouldGlitch) {
        const glitched = originalName
          .split('')
          .map(char => Math.random() > 0.7 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char)
          .join('');
        setGlitchText(glitched);
        setTimeout(() => setGlitchText(originalName), 50);
      }
    };

    const interval = setInterval(glitch, 2000);
    return () => clearInterval(interval);
  }, [visible, targetName]);

  if (!visible) return null;

  const typeLabel = targetType.toUpperCase();
  const scanComplete = scanProgress === 100;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        fontFamily: '"Courier New", monospace',
        zIndex: 1000,
        animation: 'hudFadeIn 0.3s ease-out',
      }}
    >
      <style jsx>{`
        @keyframes hudFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
        @keyframes scanLine {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 10px ${color}40, inset 0 0 10px ${color}20; }
          50% { box-shadow: 0 0 20px ${color}80, inset 0 0 20px ${color}40; }
        }
      `}</style>

      {/* Main HUD Container */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (!expanded && onExpand) {
            onExpand();
          }
        }}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0a0a0a95, #1a1a1a90)',
          backdropFilter: 'blur(12px)',
          border: `2px solid ${color}`,
          borderRadius: '4px',
          padding: expanded ? '16px' : '12px',
          minWidth: expanded ? '320px' : '240px',
          maxWidth: '400px',
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}10`,
          animation: 'borderGlow 2s ease-in-out infinite',
          cursor: !expanded ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Corner Accents */}
        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: `4px solid ${color}`, borderLeft: `4px solid ${color}` }} />
        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: `4px solid ${color}`, borderRight: `4px solid ${color}` }} />
        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: `4px solid ${color}`, borderLeft: `4px solid ${color}` }} />
        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: `4px solid ${color}`, borderRight: `4px solid ${color}` }} />

        {/* Scan Line Effect */}
        {!scanComplete && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              animation: 'scanLine 0.6s linear infinite',
              opacity: 0.6,
            }}
          />
        )}

        {/* Header - Type & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span style={{ color: color, fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px' }}>
              [{typeLabel}]
            </span>
          </div>
          <span style={{ color: '#4ade80', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
            {status}
          </span>
        </div>

        {/* Target Name */}
        <h2
          style={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: `0 0 10px ${color}60`,
          }}
        >
          {glitchText}
        </h2>

        {/* Subtitle - Always shown */}
        {subtitle && (
          <p style={{ color: color, fontSize: '12px', margin: '0 0 8px 0', opacity: 0.9 }}>
            {subtitle}
          </p>
        )}

        {/* Collapsed state - minimal info */}
        {!expanded && scanComplete && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              background: `${color}15`,
              border: `1px solid ${color}40`,
              borderRadius: '2px',
              marginTop: '8px',
            }}
          >
            <span style={{ color: color, fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
              CLICK FOR DETAILS
            </span>
          </div>
        )}

        {/* Expanded state - full information */}
        {expanded && (
          <>
            {/* Scan Progress Bar */}
            <div
              style={{
                height: '4px',
                background: '#1a1a1a',
                border: `1px solid ${color}40`,
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${scanProgress}%`,
                  background: `linear-gradient(90deg, ${color}60, ${color})`,
                  boxShadow: `0 0 10px ${color}`,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            {/* Description */}
            {description && (
              <p
                style={{
                  color: '#cccccc',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  margin: '0 0 12px 0',
                  borderLeft: `2px solid ${color}40`,
                  paddingLeft: '8px',
                }}
              >
                {description}
              </p>
            )}

            {/* Metadata Grid */}
            {metadata && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '8px',
                  background: '#00000040',
                  border: `1px solid ${color}20`,
                  borderRadius: '2px',
                }}
              >
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key}>
                    <div style={{ color: color, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                      {key}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Distance & Coordinates */}
            {(distance !== undefined || coordinates) && (
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '12px',
                  fontSize: '10px',
                  color: '#999999',
                }}
              >
                {distance !== undefined && (
                  <div>
                    <span style={{ color: color }}>DIST:</span> {distance.toFixed(2)}u
                  </div>
                )}
                {coordinates && (
                  <div>
                    <span style={{ color: color }}>POS:</span> [{coordinates.x.toFixed(1)}, {coordinates.y.toFixed(1)}, {coordinates.z.toFixed(1)}]
                  </div>
                )}
              </div>
            )}

            {/* Action Hint */}
            {actionHint && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px',
                  background: `${color}15`,
                  border: `1px solid ${color}40`,
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    width: '0',
                    height: '0',
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: `8px solid ${color}`,
                  }}
                />
                <span style={{ color: color, fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {actionHint}
                </span>
              </div>
            )}
          </>
        )}

        {/* Noise Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff02 2px, #ffffff02 4px)',
            pointerEvents: 'none',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Targeting Reticle - Above HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translate(-50%, -20px)',
          width: '40px',
          height: '40px',
        }}
      >
        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
        
        {/* Corner brackets */}
        {[0, 90, 180, 270].map((rotation) => (
          <div
            key={rotation}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '12px',
                height: '12px',
                borderTop: `2px solid ${color}`,
                borderLeft: `2px solid ${color}`,
                boxShadow: `0 0 5px ${color}80`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
