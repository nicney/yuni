// Responsive breakpoints configuration
export const BREAKPOINTS = {
  mobile: 600,    // <600px
  tablet: 1024,   // 600-1024px
  desktop: 1280,  // >1024px
} as const;

export const VIEWPORTS = {
  mobile: { width: 360, height: 800 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
export type Viewport = keyof typeof VIEWPORTS;

// Helper functions
export const getBreakpoint = (width: number): Breakpoint => {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

export const isMobile = (width: number): boolean => width < BREAKPOINTS.mobile;
export const isTablet = (width: number): boolean => 
  width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
export const isDesktop = (width: number): boolean => width >= BREAKPOINTS.tablet;
