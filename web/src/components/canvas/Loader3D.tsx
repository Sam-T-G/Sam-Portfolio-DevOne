"use client";
import { Html, useProgress } from '@react-three/drei';

export default function Loader3D() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[var(--accent-teal)] border-t-transparent"></div>
        <p className="text-sm font-medium text-[var(--charcoal)]">
          Loading 3D Experience... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}
