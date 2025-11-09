"use client";
import { useEffect, useRef, useCallback } from 'react';

interface TouchNavigationConfig {
  /** Minimum swipe distance in pixels to trigger navigation */
  minSwipeDistance?: number;
  /** Maximum time in ms for a swipe gesture */
  maxSwipeTime?: number;
  /** Velocity threshold for momentum scrolling */
  velocityThreshold?: number;
  /** Enable haptic feedback on supported devices */
  enableHaptics?: boolean;
  /** Callback when swipe up detected */
  onSwipeUp?: () => void;
  /** Callback when swipe down detected */
  onSwipeDown?: () => void;
  /** Callback when swipe left detected */
  onSwipeLeft?: () => void;
  /** Callback when swipe right detected */
  onSwipeRight?: () => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

/**
 * Industry-standard mobile touch navigation hook
 * Implements gesture recognition with momentum physics
 */
export function useMobileTouch(config: TouchNavigationConfig = {}) {
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    velocityThreshold = 0.5,
    enableHaptics = true,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  } = config;

  const touchData = useRef<TouchData>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
  });

  const triggerHaptic = useCallback(() => {
    if (enableHaptics && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [enableHaptics]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchData.current.isDragging) return;

    const touch = e.touches[0];
    touchData.current.currentX = touch.clientX;
    touchData.current.currentY = touch.clientY;

    // Prevent default scroll behavior during active gesture
    const deltaX = Math.abs(touch.clientX - touchData.current.startX);
    const deltaY = Math.abs(touch.clientY - touchData.current.startY);
    
    // Only prevent default if horizontal swipe is dominant
    if (deltaX > deltaY && deltaX > 20) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchData.current.isDragging) return;

    const {
      startX,
      startY,
      startTime,
      currentX,
      currentY,
    } = touchData.current;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const deltaTime = Date.now() - startTime;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Calculate velocity (pixels per millisecond)
    const velocityX = absDeltaX / deltaTime;
    const velocityY = absDeltaY / deltaTime;

    // Determine if this is a valid swipe gesture
    const isValidSwipe = 
      (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) &&
      deltaTime < maxSwipeTime &&
      (velocityX > velocityThreshold || velocityY > velocityThreshold);

    if (isValidSwipe) {
      // Determine primary direction
      if (absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY < 0 && onSwipeUp) {
          triggerHaptic();
          onSwipeUp();
        } else if (deltaY > 0 && onSwipeDown) {
          triggerHaptic();
          onSwipeDown();
        }
      } else {
        // Horizontal swipe
        if (deltaX < 0 && onSwipeLeft) {
          triggerHaptic();
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          triggerHaptic();
          onSwipeRight();
        }
      }
    }

    touchData.current.isDragging = false;
  }, [
    minSwipeDistance,
    maxSwipeTime,
    velocityThreshold,
    triggerHaptic,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  ]);

  useEffect(() => {
    // Only attach touch listeners on touch-capable devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Hook doesn't need to return anything - it manages touch gestures internally
  return null;
}
