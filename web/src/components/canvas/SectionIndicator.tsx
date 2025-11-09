"use client";
import { useEffect, useState } from 'react';

interface SectionIndicatorProps {
  activeSection: string;
  projects?: Array<{ id: number; title: string; subtitle: string; color: string }>;
}

export default function SectionIndicator({ activeSection, projects = [] }: SectionIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Section display data
  const sectionData: Record<string, { label: string; subtitle: string; icon: string; color?: string }> = {
    home: {
      label: "ABOUT ME",
      subtitle: "Welcome Station",
      icon: "◆",
    },
    skills: {
      label: "SKILLS",
      subtitle: "Technical Arsenal",
      icon: "◼",
    },
    contact: {
      label: "CONTACT",
      subtitle: "Communication Hub",
      icon: "●",
    },
  };

  // Check if it's a project section
  const isProjectSection = activeSection.startsWith('project-');
  let currentSection = sectionData[activeSection] || sectionData.home;

  if (isProjectSection) {
    const projectIndex = parseInt(activeSection.split('-')[1]);
    const project = projects[projectIndex];
    
    if (project) {
      currentSection = {
        label: project.title.toUpperCase(),
        subtitle: project.subtitle,
        icon: "▲",
        color: project.color,
      };
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 1000,
        fontFamily: '"Courier New", monospace',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-out, top 0.3s ease',
        pointerEvents: 'none',
      }}
      className="section-indicator-responsive"
    >
      <style>{`
        /* Mobile: Scale down by 20% for compact display + reduce vertical spacing */
        @media (max-width: 768px) {
          .section-indicator-responsive .hud-container {
            transform: scale(0.8);
            transform-origin: top center;
            margin-top: -8px;
            padding: 10px 16px !important;
          }
          
          .section-indicator-responsive .location-header {
            font-size: 9px !important;
          }
          
          .section-indicator-responsive .section-label {
            font-size: 16px !important;
            letter-spacing: 2px !important;
          }
          
          .section-indicator-responsive .section-subtitle {
            font-size: 10px !important;
          }
          
          .section-indicator-responsive .icon {
            font-size: 20px !important;
          }
          
          /* Reduce internal spacing on mobile */
          .section-indicator-responsive .hud-container > div:first-of-type {
            gap: 6px !important;
            margin-bottom: 5px !important;
            padding-bottom: 5px !important;
          }
          
          .section-indicator-responsive .hud-container > div:nth-of-type(2) {
            gap: 8px !important;
            margin-bottom: 4px !important;
          }
        }
        
        /* Mobile: Explicit margins for proper spacing and visual balance */
        .section-indicator-responsive .hud-container {
          padding: 16px 20px;
          min-width: 300px;
          max-width: 86vw;
          width: 86vw;
          margin: 0 7vw;
          box-sizing: border-box;
        }
        
        .section-indicator-responsive .location-header {
          font-size: 12px;
        }
        
        .section-indicator-responsive .section-label {
          font-size: 22px;
          letter-spacing: 2.5px;
        }
        
        .section-indicator-responsive .section-subtitle {
          font-size: 13px;
        }
        
        .section-indicator-responsive .icon {
          font-size: 28px;
        }
        
        /* Tablet: Transitional sizing with generous margins */
        @media (min-width: 769px) and (max-width: 1024px) {
          .section-indicator-responsive {
            left: auto !important;
            right: 0 !important;
            justify-content: flex-end !important;
            padding-right: 32px;
          }
          
          .section-indicator-responsive .hud-container {
            padding: 16px 20px;
            min-width: 280px;
            max-width: 480px;
            width: auto;
            margin: 0 16px 0 0;
          }
          
          .section-indicator-responsive .location-header {
            font-size: 11px;
          }
          
          .section-indicator-responsive .section-label {
            font-size: 20px;
            letter-spacing: 2.2px;
          }
          
          .section-indicator-responsive .section-subtitle {
            font-size: 12px;
          }
          
          .section-indicator-responsive .icon {
            font-size: 26px;
          }
        }
        
        /* Desktop: Right-aligned with generous margin */
        @media (min-width: 1025px) {
          .section-indicator-responsive {
            left: auto !important;
            right: 0 !important;
            justify-content: flex-end !important;
            padding-right: 40px;
          }
          
          .section-indicator-responsive .hud-container {
            padding: 16px 20px;
            min-width: 260px;
            max-width: 420px;
            width: auto;
            margin: 0 8px 0 0;
          }
          
          .section-indicator-responsive .location-header {
            font-size: 10px;
          }
          
          .section-indicator-responsive .section-label {
            font-size: 18px;
            letter-spacing: 2px;
          }
          
          .section-indicator-responsive .section-subtitle {
            font-size: 11px;
          }
          
          .section-indicator-responsive .icon {
            font-size: 24px;
          }
        }
      `}</style>
      {/* Main HUD Container */}
      <div
        className="hud-container"
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #000000f0, #0a0a0ae8)',
          backdropFilter: 'blur(16px)',
          border: `3px solid ${currentSection.color || '#0891B2'}`,
          borderRadius: '6px',
          boxShadow: `0 0 40px ${currentSection.color || '#0891B2'}60, inset 0 0 30px ${currentSection.color || '#0891B2'}15, 0 4px 20px #00000080`,
          animation: 'borderPulse 3s ease-in-out infinite',
        }}
      >
        <style jsx>{`
          @keyframes borderPulse {
            0%, 100% {
              box-shadow: 0 0 30px ${currentSection.color || '#0891B2'}40, inset 0 0 20px ${currentSection.color || '#0891B2'}10;
              box-shadow: 0 0 30px #0891B240, inset 0 0 20px #0891B210;
            }
            50% {
              box-shadow: 0 0 40px #0891B260, inset 0 0 30px #0891B220;
            }
          }
          @keyframes scanLine {
            0% {
              top: 0;
              opacity: 0.8;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
        `}</style>

        {/* Corner Accents */}
        <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '24px', height: '24px', borderTop: `5px solid ${currentSection.color || '#0891B2'}`, borderLeft: `5px solid ${currentSection.color || '#0891B2'}` }} />
        <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '24px', height: '24px', borderTop: `5px solid ${currentSection.color || '#0891B2'}`, borderRight: `5px solid ${currentSection.color || '#0891B2'}` }} />
        <div style={{ position: 'absolute', bottom: '-3px', left: '-3px', width: '24px', height: '24px', borderBottom: `5px solid ${currentSection.color || '#0891B2'}`, borderLeft: `5px solid ${currentSection.color || '#0891B2'}` }} />
        <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '24px', height: '24px', borderBottom: `5px solid ${currentSection.color || '#0891B2'}`, borderRight: `5px solid ${currentSection.color || '#0891B2'}` }} />

        {/* Scan Line Effect */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${currentSection.color || '#0891B2'}, transparent)`,
            animation: 'scanLine 2s linear infinite',
          }}
        />

        {/* Header: LOCATION */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
            paddingBottom: '6px',
            borderBottom: '1px solid #0891B240',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#0891B2',
              boxShadow: '0 0 10px #0891B2',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            className="location-header"
            style={{
              color: '#0891B2',
              fontWeight: 'bold',
              letterSpacing: '1.5px',
              opacity: 0.8,
            }}
          >
            CURRENT LOCATION
          </span>
        </div>

        {/* Section Icon and Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '0px',
          }}
        >
          <div
            className="icon"
            style={{
              color: '#0891B2',
              textShadow: '0 0 10px #0891B260',
              lineHeight: 1,
            }}
          >
            {currentSection.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h2
              className="section-label"
              style={{
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0,
                textShadow: '0 0 10px #0891B240',
              }}
            >
              {currentSection.label}
            </h2>
            <p
              className="section-subtitle"
              style={{
                color: '#0891B2',
                margin: 0,
                marginTop: '2px',
                letterSpacing: '0.5px',
                opacity: 0.9,
              }}
            >
              {currentSection.subtitle}
            </p>
          </div>
        </div>


        {/* Noise Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff02 2px, #ffffff02 4px)',
            pointerEvents: 'none',
            opacity: 0.3,
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}
