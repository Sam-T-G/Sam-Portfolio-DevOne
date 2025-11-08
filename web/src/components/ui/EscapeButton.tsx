"use client";
import { motion, AnimatePresence } from 'framer-motion';

interface EscapeButtonProps {
  show: boolean;
  label?: string;
}

export default function EscapeButton({ show, label = "Press ESC to return" }: EscapeButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <div 
            className="flex items-center gap-3 rounded-full px-6 py-3"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.75))',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(0, 0, 0, 0.9)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* ESC key visual */}
            <div 
              className="flex h-8 min-w-[3rem] items-center justify-center rounded-md px-3 font-mono text-sm font-semibold tracking-wider"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                border: '2px solid rgba(255, 255, 255, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)',
                color: 'rgba(0, 0, 0, 0.9)',
              }}
            >
              ESC
            </div>
            
            {/* Label text */}
            <span 
              className="text-sm font-medium tracking-wide"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              {label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
