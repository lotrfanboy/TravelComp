import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if viewport is mobile-sized
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Common breakpoint for mobile
    };

    // Initialize on mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up event listener
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}