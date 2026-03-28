import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollNow = () => window.scrollTo(0, 0);

    // iOS friendly
    scrollNow();
    requestAnimationFrame(scrollNow);
    setTimeout(scrollNow, 50);
  }, [pathname]);

  return null;
};