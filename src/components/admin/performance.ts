/**
 * Performance optimization utilities for the admin dashboard
 */

// Throttle function to limit how often a function can be called
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
};

// Debounce function to delay execution until after a pause
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if browser supports hardware acceleration
export const supportsHardwareAcceleration = (): boolean => {
  // Check for transform3d capability as a proxy for hardware acceleration
  const el = document.createElement('div');
  const prefixes = ['', 'webkit', 'moz', 'ms', 'o'];
  const transformProperty = prefixes.find(prefix => {
    const prefixedProperty = prefix ? `${prefix}Transform` : 'transform';
    return el.style[prefixedProperty as any] !== undefined;
  });
  
  return Boolean(transformProperty);
};

// Smart animation handler that reduces animations based on device capabilities
export const getSmartAnimationProps = (
  performanceLevel: 'low' | 'medium' | 'high' = 'high'
) => {
  const isReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Disable or reduce animations for reduced motion preference
  if (isReducedMotion) {
    return {
      skipAnimation: true,
      transition: { duration: 0 },
    };
  }
  
  // Adjust animations based on performance level
  switch (performanceLevel) {
    case 'low':
      return {
        skipStaggering: true,
        simplifyEffects: true,
        transition: { duration: 0.2 },
      };
    case 'medium':
      return {
        skipStaggering: false,
        simplifyEffects: true,
        transition: { duration: 0.3 },
      };
    case 'high':
    default:
      return {
        skipStaggering: false,
        simplifyEffects: false,
        transition: { duration: 0.5 },
      };
  }
};

// Optimize image loading
export const optimizeImageLoading = (
  element: HTMLImageElement, 
  options?: { lowQualitySrc?: string, blur?: boolean }
) => {
  if (!element) return;
  
  const originalSrc = element.src;
  
  if (options?.lowQualitySrc) {
    // Start with low quality image
    element.src = options.lowQualitySrc;
    
    // Apply blur if requested
    if (options.blur) {
      element.style.filter = 'blur(10px)';
      element.style.transition = 'filter 0.3s ease-out';
    }
  }
  
  // Preload high quality image
  const highQualityImage = new Image();
  highQualityImage.src = originalSrc;
  
  highQualityImage.onload = () => {
    element.src = originalSrc;
    
    if (options?.blur) {
      setTimeout(() => {
        element.style.filter = 'blur(0)';
      }, 10);
    }
  };
};

// Detect device performance level
export const detectPerformanceLevel = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'medium';
  
  // Check for device memory (available in Chrome)
  const memory = (navigator as any).deviceMemory;
  if (memory) {
    if (memory <= 2) return 'low';
    if (memory <= 4) return 'medium';
    return 'high';
  }
  
  // Fallback to user agent sniffing for older devices
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  
  if (isMobile) {
    // Further detect high-end mobile devices
    const isHighEndMobile = /iphone 11|iphone 12|iphone 13|iphone 14|iphone 15|samsung s20|samsung s21|samsung s22|samsung s23|pixel 6|pixel 7|pixel 8/i.test(ua);
    return isHighEndMobile ? 'medium' : 'low';
  }
  
  return 'high';
};

// Intelligent component rendering that prioritizes user interactions
export const usePrioritizedRendering = (
  criticalRender: () => JSX.Element,
  deferredRender: () => JSX.Element,
  timeoutMs: number = 200
) => {
  if (typeof window === 'undefined') return criticalRender();
  
  // Start with critical content
  const result = criticalRender();
  
  // Schedule deferred content
  window.requestIdleCallback 
    ? window.requestIdleCallback(() => deferredRender(), { timeout: timeoutMs })
    : setTimeout(deferredRender, timeoutMs);
  
  return result;
};

// Export all utilities
export const performance = {
  throttle,
  debounce,
  supportsHardwareAcceleration,
  getSmartAnimationProps,
  optimizeImageLoading,
  detectPerformanceLevel,
  usePrioritizedRendering,
}; 