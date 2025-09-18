import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { getBreakpoint, type Breakpoint } from '../styles/breakpoints';

export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setBreakpoint(getBreakpoint(window.width));
    });

    // Set initial breakpoint
    setBreakpoint(getBreakpoint(dimensions.width));

    return () => subscription?.remove();
  }, [dimensions.width]);

  return {
    breakpoint,
    width: dimensions.width,
    height: dimensions.height,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
};
