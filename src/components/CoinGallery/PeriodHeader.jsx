/* src/components/CoinGallery/PeriodHeader.jsx */
"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function PeriodHeader({
  title,
  count,
  ownedCount,
  isExpanded,
  borderColor,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        minHeight: "100%", 
        padding: "0.75rem 0",
        userSelect: "none",
        // APPLY VARIABLE HERE so both Text and Icon inherit it
        color: "var(--text-period-header)", 
      }}
    >
      <div
        style={{
          marginRight: "0.5rem",
          transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
          flexShrink: 0,
          transition: "transform 0.2s ease",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Icon will now inherit 'currentColor' from the parent div */}
        <ChevronDown size={18} />
      </div>

      <h3
        style={{
          fontSize: "1rem",
          fontWeight: "700",
          // REMOVED: color: "#475569", 
          // ADDED: inherit allows it to use the parent's variable
          color: "inherit", 
          margin: 0,
          borderLeft: `4px solid ${borderColor}`,
          paddingLeft: "0.75rem",
          whiteSpace: "normal",
          overflow: "visible",
          lineHeight: "1.3",
        }}
      >
        {title}
      </h3>

      <span
        style={{
          fontSize: "0.85rem",
          // Suggestion: Use a variable for this background too if you want it dark in dark mode
          // e.g. background: "var(--bg-subtle)", 
          background: "#f1f5f9", 
          marginLeft: "auto",
          padding: "0.25rem 0.5rem",
          whiteSpace: "nowrap",
          flexShrink: 0,
          borderRadius: "12px",
        }}
      >
        <span className="text-gold">{count} coins</span>
        {ownedCount > 0 && (
           <span className="mobile-hidden" style={{ color: "var(--status-green-text)", marginLeft: "0.5rem" }}>
             • {ownedCount} owned
           </span>
        )}
      </span>
    </div>
  );
}