/* src/components/ThemeToggle.jsx */
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder with passed class to prevent layout shift
    return <div className={className} aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={className} // Inherit dimensions from Header CSS
    >
      {isDark ? (
        <Sun size={26} className="text-gold" />
      ) : (
        <Moon size={26} />
      )}
    </button>
  );
}