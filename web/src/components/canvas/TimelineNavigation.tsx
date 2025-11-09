"use client";
import { useState } from 'react';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
}

interface TimelineNavigationProps {
  activeSection: string;
  projects: Project[];
}

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  type: 'section' | 'project';
}

export default function TimelineNavigation({ activeSection, projects }: TimelineNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Build navigation items
  const navItems: NavItem[] = [
    { id: 'home', label: 'About Me', shortLabel: 'A', color: '#0891B2', type: 'section' },
    ...projects.map((project, index) => ({
      id: `project-${index}`,
      label: project.title,
      shortLabel: `P${index + 1}`,
      color: project.color,
      type: 'project' as const,
    })),
    { id: 'skills', label: 'Skills', shortLabel: 'S', color: '#0891B2', type: 'section' },
    { id: 'contact', label: 'Contact', shortLabel: 'C', color: '#0891B2', type: 'section' },
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeSection);
  const progress = activeIndex >= 0 ? ((activeIndex + 1) / navItems.length) * 100 : 0;

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="timeline-nav-responsive"
      style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 999,
        fontFamily: '"Courier New", monospace',
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <style>{`
        .timeline-nav-responsive {
          display: block;
        }
        
        @media (max-width: 768px) {
          .timeline-nav-responsive {
            display: none;
          }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
        }}
      >
        {/* Timeline Track */}
        <div
          style={{
            position: 'absolute',
            right: isExpanded ? '164px' : '20px',
            top: 0,
            bottom: 0,
            width: '3px',
            background: 'linear-gradient(180deg, #0891B220, #0891B260, #0891B220)',
            borderRadius: '2px',
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Progress Indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${progress}%`,
              background: `linear-gradient(180deg, ${navItems[activeIndex]?.color || '#0891B2'}, ${navItems[activeIndex]?.color || '#0891B2'}dd)`,
              borderRadius: '2px',
              boxShadow: `0 0 10px ${navItems[activeIndex]?.color || '#0891B2'}80`,
              transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
            }}
          />
        </div>

        {/* Navigation Points */}
        {navItems.map((item, index) => {
          const isActive = item.id === activeSection;
          const isPast = index < activeIndex;

          return (
            <div
              key={item.id}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => handleNavigate(item.id)}
            >
              {/* Label - Expands on hover */}
              <div
                style={{
                  position: 'relative',
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateX(0)' : 'translateX(20px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: `${index * 0.03}s`,
                  pointerEvents: isExpanded ? 'auto' : 'none',
                }}
              >
                <div
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, #000000f5, #0a0a0af0)` 
                      : 'linear-gradient(135deg, #000000d0, #0a0a0ac0)',
                    backdropFilter: 'blur(12px)',
                    border: `2px solid ${isActive ? item.color : '#0891B240'}`,
                    borderRadius: '4px',
                    padding: '8px 14px',
                    minWidth: '120px',
                    boxShadow: isActive 
                      ? `0 0 20px ${item.color}60, inset 0 0 15px ${item.color}10` 
                      : '0 2px 10px #00000060',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.boxShadow = `0 0 25px ${item.color}70, inset 0 0 20px ${item.color}15`;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isActive ? item.color : '#0891B240';
                    e.currentTarget.style.boxShadow = isActive 
                      ? `0 0 20px ${item.color}60, inset 0 0 15px ${item.color}10` 
                      : '0 2px 10px #00000060';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Corner Accents */}
                  {isActive && (
                    <>
                      <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '12px', height: '12px', borderTop: `3px solid ${item.color}`, borderLeft: `3px solid ${item.color}` }} />
                      <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderTop: `3px solid ${item.color}`, borderRight: `3px solid ${item.color}` }} />
                      <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '12px', height: '12px', borderBottom: `3px solid ${item.color}`, borderLeft: `3px solid ${item.color}` }} />
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderBottom: `3px solid ${item.color}`, borderRight: `3px solid ${item.color}` }} />
                    </>
                  )}

                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: isActive ? '#ffffff' : '#cccccc',
                      textShadow: isActive ? `0 0 10px ${item.color}60` : 'none',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.label}
                  </div>
                  
                  {item.type === 'project' && (
                    <div
                      style={{
                        fontSize: '9px',
                        color: item.color,
                        marginTop: '2px',
                        opacity: 0.8,
                        letterSpacing: '0.5px',
                      }}
                    >
                      PROJECT {item.shortLabel.substring(1)}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Dot */}
              <div
                style={{
                  position: 'relative',
                  width: isActive ? '16px' : '12px',
                  height: isActive ? '16px' : '12px',
                  borderRadius: '50%',
                  background: isActive || isPast ? item.color : '#0891B240',
                  border: `2px solid ${isActive ? item.color : isPast ? `${item.color}80` : '#0891B220'}`,
                  boxShadow: isActive 
                    ? `0 0 15px ${item.color}90, inset 0 0 8px ${item.color}40` 
                    : isPast 
                    ? `0 0 8px ${item.color}50` 
                    : '0 0 4px #0891B230',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isActive ? 10 : 5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.3)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${item.color}, inset 0 0 10px ${item.color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = isActive 
                    ? `0 0 15px ${item.color}90, inset 0 0 8px ${item.color}40` 
                    : isPast 
                    ? `0 0 8px ${item.color}50` 
                    : '0 0 4px #0891B230';
                }}
              >
                {/* Inner Glow */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '2px',
                      borderRadius: '50%',
                      background: item.color,
                      opacity: 0.6,
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Instructions - Appears on first hover */}
      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: 0,
            background: 'linear-gradient(135deg, #000000f0, #0a0a0ae8)',
            backdropFilter: 'blur(12px)',
            border: '2px solid #0891B260',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '9px',
            color: '#0891B2',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 15px #0891B230',
            opacity: 0,
            animation: 'fadeIn 0.3s ease 0.5s forwards',
          }}
        >
          Click to Jump
        </div>
      )}
    </div>
  );
}
