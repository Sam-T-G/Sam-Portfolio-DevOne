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
  onSectionChange?: (section: string) => void;
}

export default function PermanentSceneBackground({ 
  projects,
  onProjectClick,
  onFocusChange,
  onSectionChange
}: PermanentSceneBackgroundProps) {
  const [scrollData, setScrollData] = useState({
    scrollProgress: 0,
    activeSection: 'home',
    sectionProgress: 0,
  });
  const [focusedProject, setFocusedProject] = useState<FocusedProject | null>(null);

  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Define page sections with their scroll ranges
    // Each project gets its own dedicated viewport for cinematic presentation
    const getSections = (): SectionInfo[] => {
      const vh = window.innerHeight;
      const projectCount = projects.length;
      
      const sections: SectionInfo[] = [
        { name: 'home', start: 0, end: vh },
      ];
      
      // Add individual project sections
      for (let i = 0; i < projectCount; i++) {
        sections.push({
          name: `project-${i}`,
          start: vh * (i + 1),
          end: vh * (i + 2),
        });
      }
      
      // Add remaining sections after all projects
      // Account for h-screen spacer between projects and skills (+1vh)
      // Account for h-96 spacer between skills and contact (~0.24vh)
      sections.push(
        { name: 'skills', start: vh * (projectCount + 2), end: vh * (projectCount + 3) },
        { name: 'contact', start: vh * (projectCount + 3.24), end: vh * (projectCount + 4.24) },
      );
      
      return sections;
    };

    const calculateScrollData = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollY / docHeight, 1);
      
      const sections = getSections();
      const vh = window.innerHeight;
      let activeSection = 'home';
      let sectionProgress = 0;
      let maxOverlap = 0;

      // Find which section occupies the most viewport space (at least 60%)
      // A section is active when it takes up 60% or more of the viewport
      for (const section of sections) {
        // Calculate viewport overlap with this section
        const viewportTop = scrollY;
        const viewportBottom = scrollY + vh;
        const overlapStart = Math.max(viewportTop, section.start);
        const overlapEnd = Math.min(viewportBottom, section.end);
        const overlap = Math.max(0, overlapEnd - overlapStart);
        
        // Track section with maximum overlap
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          
          // Only consider it active if it occupies at least 60% of viewport
          if (overlap >= vh * 0.6) {
            activeSection = section.name;
            // Calculate progress within this section (0 to 1)
            sectionProgress = (scrollY - section.start) / (section.end - section.start);
          }
        }
      }
      
      // Fallback: if no section meets 60% threshold, use the one with maximum overlap
      if (maxOverlap < vh * 0.6) {
        for (const section of sections) {
          const viewportTop = scrollY;
          const viewportBottom = scrollY + vh;
          const overlapStart = Math.max(viewportTop, section.start);
          const overlapEnd = Math.min(viewportBottom, section.end);
          const overlap = Math.max(0, overlapEnd - overlapStart);
          
          if (overlap === maxOverlap && overlap > 0) {
            activeSection = section.name;
            sectionProgress = (scrollY - section.start) / (section.end - section.start);
            break;
          }
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

  // Notify parent of section changes (separate effect to avoid setState during render)
  useEffect(() => {
    if (onSectionChange) {
      onSectionChange(scrollData.activeSection);
    }
  }, [scrollData.activeSection, onSectionChange]);

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
