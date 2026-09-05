import { lazy, Suspense } from 'react';
import type { SceneVariant } from './SceneBackdrop';

const SceneBackdrop = lazy(() =>
  import('./SceneBackdrop').then((m) => ({ default: m.SceneBackdrop }))
);

/** Fixed full-page 3D atmosphere — sits behind all public content. */
export function PageScene({
  variant = 'storm',
  intensity = 0.9,
}: {
  variant?: SceneVariant;
  intensity?: number;
}) {
  return (
    <Suspense fallback={null}>
      <SceneBackdrop
        variant={variant}
        intensity={intensity}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </Suspense>
  );
}

/** @deprecated use PageScene / SceneBackdrop */
export function HeroCanvas({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <SceneBackdrop variant="storm" intensity={0.9} className={className} />
    </Suspense>
  );
}

export function sceneVariantForPath(pathname: string): SceneVariant {
  if (pathname.startsWith('/products') || pathname.startsWith('/services')) return 'lattice';
  if (pathname.startsWith('/about') || pathname.startsWith('/careers')) return 'helix';
  if (pathname.startsWith('/contact') || pathname.startsWith('/community')) return 'pulse';
  return 'storm';
}
