"use client";
import { useState, useEffect } from 'react';
import Scene from './Scene';
import HeroGeometry from './HeroGeometry';

export default function HeroSceneWithScroll() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress for hero section only
      // Hero is typically viewport height, so progress = scrollY / viewportHeight
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Normalize to 0-1 range, where 1 = scrolled past hero section
      const progress = Math.min(scrollY / viewportHeight, 1);
      setScrollProgress(progress);
    };

    // Initial calculation
    handleScroll();

    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Scene>
      <HeroGeometry scrollProgress={scrollProgress} />
    </Scene>
  );
}
