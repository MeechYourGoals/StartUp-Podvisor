import { useState, useEffect } from 'react';

export function useDespia() {
  const [isDespia, setIsDespia] = useState(false);

  useEffect(() => {
    // Check if running in Despia environment by inspecting user agent
    const checkDespia = () => {
      const isDespiaEnv = window.navigator.userAgent.includes('Despia');
      setIsDespia(isDespiaEnv);
    };

    checkDespia();
  }, []);

  return isDespia;
}
