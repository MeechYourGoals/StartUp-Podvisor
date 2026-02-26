
import { useState, useEffect } from "react";

export const useDespia = () => {
  const [isDespia, setIsDespia] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/Despia/i.test(userAgent)) {
      setIsDespia(true);
    }
  }, []);

  return isDespia;
};
