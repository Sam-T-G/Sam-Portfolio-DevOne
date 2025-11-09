/**
 * Section navigation utilities for smooth scrolling and section management
 */

export interface Section {
  id: string;
  element: HTMLElement | null;
  index: number;
}

/**
 * Get all navigable sections in the page
 */
export function getSections(): Section[] {
  const sections: Section[] = [];
  
  // Home section
  const homeSection = document.getElementById('home');
  if (homeSection) {
    sections.push({ id: 'home', element: homeSection, index: 0 });
  }
  
  // Project sections
  let projectIndex = 0;
  while (true) {
    const projectSection = document.getElementById(`project-${projectIndex}`);
    if (!projectSection) break;
    sections.push({ 
      id: `project-${projectIndex}`, 
      element: projectSection, 
      index: sections.length 
    });
    projectIndex++;
  }
  
  // Skills section
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    sections.push({ id: 'skills', element: skillsSection, index: sections.length });
  }
  
  // Contact section
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    sections.push({ id: 'contact', element: contactSection, index: sections.length });
  }
  
  return sections;
}

/**
 * Get the currently active section based on scroll position
 */
export function getCurrentSection(): Section | null {
  const sections = getSections();
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportCenter = scrollY + viewportHeight / 2;
  
  // Find section that contains the viewport center
  for (const section of sections) {
    if (!section.element) continue;
    
    const rect = section.element.getBoundingClientRect();
    const sectionTop = scrollY + rect.top;
    const sectionBottom = sectionTop + rect.height;
    
    if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
      return section;
    }
  }
  
  // Fallback to first or last section
  if (viewportCenter < 0 && sections.length > 0) {
    return sections[0];
  }
  if (sections.length > 0) {
    return sections[sections.length - 1];
  }
  
  return null;
}

/**
 * Navigate to a specific section with smooth scrolling
 */
export function navigateToSection(
  sectionId: string,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
): void {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView(options);
  }
}

/**
 * Navigate to the next section
 */
export function navigateToNextSection(): void {
  const currentSection = getCurrentSection();
  if (!currentSection) return;
  
  const sections = getSections();
  const nextIndex = currentSection.index + 1;
  
  if (nextIndex < sections.length) {
    const nextSection = sections[nextIndex];
    navigateToSection(nextSection.id);
  }
}

/**
 * Navigate to the previous section
 */
export function navigateToPreviousSection(): void {
  const currentSection = getCurrentSection();
  if (!currentSection) return;
  
  const sections = getSections();
  const prevIndex = currentSection.index - 1;
  
  if (prevIndex >= 0) {
    const prevSection = sections[prevIndex];
    navigateToSection(prevSection.id);
  }
}

/**
 * Check if we can navigate to next section
 */
export function canNavigateNext(): boolean {
  const currentSection = getCurrentSection();
  if (!currentSection) return false;
  
  const sections = getSections();
  return currentSection.index < sections.length - 1;
}

/**
 * Check if we can navigate to previous section
 */
export function canNavigatePrevious(): boolean {
  const currentSection = getCurrentSection();
  if (!currentSection) return false;
  
  return currentSection.index > 0;
}
