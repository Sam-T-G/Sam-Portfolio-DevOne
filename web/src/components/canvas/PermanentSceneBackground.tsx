"use client";
import { useState, useEffect, useRef } from 'react';
import Scene from './Scene';
import ChoreographedGeometry from './ChoreographedGeometry';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  link?: string;
}

interface SectionInfo {
  name: string;
  start: number;
  end: number;
}

interface FocusedProject {
  project: Project;
  position: [number, number, number];
}

interface PermanentSceneBackgroundProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  onFocusChange?: (focused: boolean) => void;
}

export default function PermanentSceneBackground({ 
  projects,
  onProjectClick,
  onFocusChange
}: PermanentSceneBackgroundProps) {
  const [scrollData, setScrollData] = useState({
    scrollProgress: 0,
    activeSection: 'hero',
    sectionProgress: 0,
  });
  const [focusedProject, setFocusedProject] = useState<FocusedProject | null>(null);

  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Define page sections with their scroll ranges
    const getSections = (): SectionInfo[] => {
      const vh = window.innerHeight;
      return [
        { name: 'hero', start: 0, end: vh },
        { name: 'projects', start: vh, end: vh * 2 },
        { name: 'skills', start: vh * 2, end: vh * 3 },
        { name: 'contact', start: vh * 3, end: vh * 4 },
      ];
    };

    const calculateScrollData = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollY / docHeight, 1);
      
      const sections = getSections();
      let activeSection = 'hero';
      let sectionProgress = 0;

      // Find which section we're in
      for (const section of sections) {
        if (scrollY >= section.start && scrollY < section.end) {
          activeSection = section.name;
          // Calculate progress within this section (0 to 1)
          sectionProgress = (scrollY - section.start) / (section.end - section.start);
          break;
        } else if (scrollY >= section.end) {
          // Past this section
          activeSection = section.name;
          sectionProgress = 1;
        }
      }

      setScrollData({
        scrollProgress,
        activeSection,
        sectionProgress: Math.min(Math.max(sectionProgress, 0), 1),
      });
      
      // Auto-close focused project when leaving projects section
      if (activeSection !== 'projects' && focusedProject) {
        setFocusedProject(null);
        if (onFocusChange) onFocusChange(false);
      }
    };

    // Handle ESC key to unfocus project
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedProject) {
        setFocusedProject(null);
        if (onFocusChange) onFocusChange(false);  // Fix: Notify parent to hide ESC button
      }
    };

    // Use RAF for smooth 60 FPS updates
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(calculateScrollData);
    };

    // Initial calculation
    calculateScrollData();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateScrollData, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateScrollData);
      window.removeEventListener('keydown', handleKeyDown);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [focusedProject]);

  const handleProjectFocus = (project: Project | null, position: [number, number, number]) => {
    if (project) {
      setFocusedProject({ project, position });
      if (onFocusChange) onFocusChange(true);
    } else {
      setFocusedProject(null);
      if (onFocusChange) onFocusChange(false);
    }
  };

  return (
    <div className="fixed inset-0 z-0">
      <Scene>
        <ChoreographedGeometry 
          scrollProgress={scrollData.scrollProgress}
          activeSection={scrollData.activeSection}
          sectionProgress={scrollData.sectionProgress}
          projects={projects}
          onProjectClick={onProjectClick}
          focusedProject={focusedProject}
          onProjectFocus={handleProjectFocus}
          resetTrigger={focusedProject === null}
        />
      </Scene>
    </div>
  );
}
