"use client";
import Scene from '@/components/canvas/Scene';
import HeroGeometry from '@/components/canvas/HeroGeometry';

export default function Test3D() {
  return (
    <div className="h-screen w-screen bg-[var(--bg-canvas)]">
      <div className="relative h-full w-full">
        {/* 3D Scene */}
        <Scene enableControls>
          <HeroGeometry />
        </Scene>

        {/* Overlay Text */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-display)] mb-4 text-4xl font-bold text-[var(--ink-black)]">
              Three.js Test
            </h1>
            <p className="text-[var(--charcoal)]">
              Rotating wireframe octahedron
            </p>
            <p className="mt-2 text-sm text-[var(--slate)]">
              Drag to rotate • Scroll to zoom
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
