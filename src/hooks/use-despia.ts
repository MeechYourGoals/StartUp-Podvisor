import { useState, useEffect, useMemo } from "react";

export const useDespia = () => {
  const [isDespiaEnv, setIsDespiaEnv] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/despia/i.test(userAgent)) {
      setIsDespiaEnv(true);
    }
  }, []);

  return useMemo(() => ({
    /** Whether the app is running inside the Despia native runtime */
    isDespia: () => isDespiaEnv,
  }), [isDespiaEnv]);
};
