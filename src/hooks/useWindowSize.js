"use client";
import { useState, useEffect } from "react";

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Check for window existence (client-side safe)
    if (typeof window === "undefined") return;

    let timeoutId = null;

    function handleResize() {
      // Clear existing timer
      if (timeoutId) clearTimeout(timeoutId);

      // Debounce: Wait 150ms before updating state
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    }

    // Initial Set
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return windowSize;
}