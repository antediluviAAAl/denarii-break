/* src/components/Hub/PreviewCard.jsx */
"use client";
import React from "react";
import styles from "./Hub.module.css";

export default function PreviewCard({
  title,
  subtitle,
  variant,
  onClick,
  bgImage,
}) {
  // Variant determines the 3D angle: 'left', 'right', or 'straight'
  const angleClass =
    variant === "left"
      ? styles.angledLeft
      : variant === "right"
      ? styles.angledRight
      : styles.angledStraight;

  return (
    <div className={`${styles.cardWrapper} ${angleClass}`} onClick={onClick}>
      <div className={styles.cardInner}>
        <div
          className={styles.cardBackground}
          style={{
            // The Scrim: Linear gradient from transparent to black-ish
            // combined with the image URL
            backgroundImage: `
                  linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.9) 100%),
                  url('${bgImage}')
                `,
          }}
        />
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>{title}</h2>
          <p className={styles.cardSubtitle}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
