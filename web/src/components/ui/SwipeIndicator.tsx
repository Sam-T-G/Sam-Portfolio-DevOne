"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Visual indicator for mobile swipe gestures
 * Shows on first visit, fades after user interaction
 */
export default function SwipeIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has seen the indicator before
    const hasSeenIndicator = localStorage.getItem('hasSeenSwipeIndicator');
    
    // Only show on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                     window.innerWidth < 768;
    
    if (!hasSeenIndicator && isMobile) {
      // Show after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleInteraction = () => {
      setHasInteracted(true);
      localStorage.setItem('hasSeenSwipeIndicator', 'true');
      
      // Fade out after interaction
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    };

    // Hide on any scroll or touch
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    // Auto-hide after 5 seconds
    const autoHideTimer = setTimeout(() => {
      if (!hasInteracted) {
        handleInteraction();
      }
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      clearTimeout(autoHideTimer);
    };
  }, [isVisible, hasInteracted]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/80 px-6 py-4 backdrop-blur-md">
            {/* Swipe Up Icon */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-white"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </motion.div>
            
            {/* Text */}
            <p className="text-sm font-medium text-white">
              Swipe to navigate
            </p>
            
            {/* Swipe Down Icon */}
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-white"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
