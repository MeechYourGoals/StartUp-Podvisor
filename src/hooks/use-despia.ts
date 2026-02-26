import { useState, useEffect } from "react";

export const useDespia = () => {
  const [isDespia, setIsDespia] = useState(false);

  useEffect(() => {
    setIsDespia(navigator.userAgent.includes("despia"));
  }, []);

  return isDespia;
};
