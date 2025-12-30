"use client";

import React, { useState, useEffect } from "react";
import FadeInImage from "../FadeInImage";
import styles from "./CoinDetailView.module.css";

export default function HighResCoinImage({
  label,
  srcMedium,
  srcOriginal,
  alt,
}) {
  // --- High Res Loading Logic ---
  const hasUpgrade = srcOriginal && srcOriginal !== srcMedium;
  const [currentSrc, setCurrentSrc] = useState(srcMedium || srcOriginal);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    setCurrentSrc(srcMedium || srcOriginal);
    setIsUpgrading(false);

    if (!hasUpgrade) return;

    setIsUpgrading(true);
    const img = new Image();
    img.src = srcOriginal;

    img.onload = () => {
      setCurrentSrc(srcOriginal);
      setIsUpgrading(false);
    };

    img.onerror = () => {
      console.warn("Failed to load high-res image:", srcOriginal);
      setIsUpgrading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [srcMedium, srcOriginal, hasUpgrade]);

  // --- Zoom Logic ---
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    // Get dimensions of the container
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    // Calculate mouse position as percentage (0-100)
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setCursorPos({ x, y });
  };

  return (
    <>
      {/* Label/Spinner (Absolute positioned via CSS) */}
      <h3>
        {label}
        {isUpgrading && (
          <span className={styles.spinner} title="Loading high-res..." />
        )}
      </h3>

      {/* Zoom Wrapper */}
      <div
        className={styles.zoomContainer}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <div
          className={styles.zoomTarget}
          style={{
            // The magic: Set the origin to the mouse position, then scale.
            // This creates the "pan" effect naturally.
            transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
            transform: isHovering ? "scale(2.5)" : "scale(1)",
          }}
        >
          {currentSrc ? (
            <FadeInImage
              src={currentSrc}
              srcSet={undefined} // Force 'src' usage
              sizes="100vw"
              alt={alt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              priority={true}
            />
          ) : (
            <span style={{ color: "#9ca3af" }}>No Image</span>
          )}
        </div>
      </div>
    </>
  );
}
