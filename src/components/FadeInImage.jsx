"use client";

import React, { useState } from "react";

export default function FadeInImage({
  src,
  srcSet, // NEW: Accepts list of responsive image URLs
  sizes, // NEW: Tells browser how much space the image takes up
  alt,
  className,
  style,
  fill,
  width,
  height,
  priority, // If true, we force eager loading
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Replicate Next.js 'fill' layout behavior using standard CSS
  const fillStyles = fill
    ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: "cover",
      }
    : {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt || "Coin Image"}
      className={`${className || ""} ${isLoaded ? "loaded" : ""}`}
      style={{
        ...style,
        ...fillStyles,
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.4s ease-in-out",
      }}
      width={width}
      height={height}
      // Native Lazy Loading & Async Decoding
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}
