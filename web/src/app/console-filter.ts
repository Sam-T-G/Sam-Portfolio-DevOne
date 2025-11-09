/**
 * Console filter to suppress React DevTools semver error
 * This is a workaround for React 19.x compatibility issues with older DevTools versions
 * 
 * Only use in development - remove before production build
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    // Suppress React DevTools semver error
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Invalid argument not valid semver')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}
