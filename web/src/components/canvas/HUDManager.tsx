"use client";
import { useState, useCallback, useEffect } from 'react';
import GameHUD from './GameHUD';

export interface HUDData {
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
  position?: { x: number; y: number };
}

export default function HUDManager() {
  const [hudData, setHudData] = useState<HUDData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const showHUD = useCallback((data: HUDData) => {
    if (isLocked) return; // Don't change HUD if locked
    setHudData(data);
    setIsVisible(true);
    setIsExpanded(false);
  }, [isLocked]);

  const hideHUD = useCallback(() => {
    if (isLocked) return; // Don't hide if locked
    setIsVisible(false);
    setIsExpanded(false);
    // Keep data for smooth fade out
    setTimeout(() => setHudData(null), 300);
  }, [isLocked]);

  const expandHUD = useCallback(() => {
    setIsExpanded(true);
    setIsLocked(true);
  }, []);

  // Listen for custom events
  useEffect(() => {
    const handleShow = (e: Event) => {
      const customEvent = e as CustomEvent<HUDData>;
      showHUD(customEvent.detail);
    };

    const handleHide = () => {
      hideHUD();
    };

    const handleUnlock = () => {
      setIsLocked(false);
      setIsExpanded(false);
      setIsVisible(false);
    };

    window.addEventListener('show-hud', handleShow);
    window.addEventListener('hide-hud', handleHide);
    window.addEventListener('unlock-hud', handleUnlock);

    return () => {
      window.removeEventListener('show-hud', handleShow);
      window.removeEventListener('hide-hud', handleHide);
      window.removeEventListener('unlock-hud', handleUnlock);
    };
  }, [showHUD, hideHUD]);

  return (
    <>
      {hudData && (
        <GameHUD
          targetName={hudData.targetName}
          targetType={hudData.targetType}
          subtitle={hudData.subtitle}
          description={hudData.description}
          status={hudData.status}
          distance={hudData.distance}
          coordinates={hudData.coordinates}
          metadata={hudData.metadata}
          actionHint={hudData.actionHint}
          color={hudData.color}
          visible={isVisible}
          position={hudData.position}
          expanded={isExpanded}
          onExpand={expandHUD}
        />
      )}
    </>
  );
}

// Export HUD controller functions
export function useHUD() {
  return {
    showHUD: (data: HUDData) => {
      window.dispatchEvent(new CustomEvent('show-hud', { detail: data }));
    },
    hideHUD: () => {
      window.dispatchEvent(new CustomEvent('hide-hud'));
    },
  };
}
