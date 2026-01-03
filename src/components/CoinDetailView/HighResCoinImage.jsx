/* src/components/CoinDetailView/HighResCoinImage.jsx */
"use client";

import React, { useState, useEffect } from "react";
import { Circle } from "lucide-react"; // Import the Circle icon
import FadeInImage from "../FadeInImage";
import styles from "./CoinDetailView.module.css";

export default function HighResCoinImage({
  label,
  srcMedium,
  srcOriginal,
  alt,
}) {
  // --- State Management ---
  const hasUpgrade = srcOriginal && srcOriginal !== srcMedium;
  const [currentSrc, setCurrentSrc] = useState(srcMedium || srcOriginal);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(srcMedium || srcOriginal);
    setHasError(false);
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
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
  };

  // Logic: Show image if we have a source AND it didn't error out
  const showImage = currentSrc && !hasError;

  return (
    <>
      <h3>
        {label}

        {/* 1. Loading Spinner (Orange/Brand) */}
        {isUpgrading && !hasError && (
          <span className={styles.spinner} title="Loading high-res..." />
        )}

        {/* 2. No Image Indicator (Red Circle) */}
        {!showImage && (
          <Circle
            size={16}
            color="#ef4444" // Red (Tailwind red-500 equivalent)
            strokeWidth={2.5}
            style={{
              display: "inline-block",
              verticalAlign: "text-bottom",
              opacity: 0.7,
            }}
          />
        )}
      </h3>

      {showImage ? (
        // --- REAL IMAGE STATE ---
        <div
          className={styles.zoomContainer}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          <div
            className={styles.zoomTarget}
            style={{
              transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
              transform: isHovering ? "scale(2.5)" : "scale(1)",
            }}
          >
            <FadeInImage
              src={currentSrc}
              srcSet={undefined}
              sizes="100vw"
              alt={alt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              priority={true}
              onError={() => setHasError(true)}
            />
          </div>
        </div>
      ) : (
        // --- PLACEHOLDER STATE (Blank Planchet) ---
        <div className={styles.zoomContainer} style={{ cursor: "default" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#f3f4f6", // Light Gray (Neutral)
              borderRadius: "50%", // Circular Planchet
            }}
          />
        </div>
      )}
    </>
  );
}
