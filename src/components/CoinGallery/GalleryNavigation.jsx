/* src/components/CoinGallery/GalleryNavigation.jsx */
"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Map } from "lucide-react";

export default function GalleryNavigation({
  groupedCoins,
  getCoinsByPeriod,
  onScrollTo,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e) => e.key === "Escape" && setIsOpen(false);
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  if (!groupedCoins || groupedCoins.length === 0) return null;

  return (
    <>
      {/* Floating Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--brand-gold)",
          color: "var(--text-inverse)",
          boxShadow: "0 4px 12px rgba(217, 119, 6, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          border: "none",
          cursor: "pointer",
          transition: "transform 0.2s, background-color 0.2s",
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--brand-gold-dim)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--brand-gold)"}
        title="Table of Contents"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "6.5rem",
            right: "2rem",
            width: "300px",
            maxHeight: "60vh",
            backgroundColor: "var(--bg-card)", 
            borderRadius: "12px",
            boxShadow: "var(--shadow-xl)", 
            zIndex: 99,
            overflowY: "auto",
            padding: "1rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "0.5rem",
            }}
          >
            <Map size={16} />
            <span>Contents</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groupedCoins.map((group) => {
              const isActive = activeGroup === group.id;
              
              const periods = getCoinsByPeriod(group.coins);

              return (
                <div key={group.id}>
                  <div
                    onClick={() => {
                      setActiveGroup(isActive ? null : group.id);
                    }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 0.5rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: isActive ? "var(--text-main)" : "var(--text-secondary)",
                      fontWeight: isActive ? 600 : 500,
                      transition: "background 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
                        e.currentTarget.style.color = "var(--brand-gold)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    <span>{group.name}</span>
                    <span 
                      style={{ 
                        fontSize: "0.75rem", 
                        opacity: isActive ? 1 : 0.7,
                        color: isActive ? "var(--brand-gold)" : "inherit",
                        fontWeight: isActive ? 700 : 400
                      }}
                    >
                      {group.coins.length}
                    </span>
                  </div>

                  {isActive && (
                    <div
                      style={{
                        marginLeft: "0.5rem",
                        marginTop: "0.25rem",
                        paddingLeft: "0.75rem",
                        borderLeft: `2px solid ${group.color.border}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      {periods.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onScrollTo(group.id, p.id);
                            if (window.innerWidth < 768) setIsOpen(false);
                          }}
                          style={{
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            padding: "0.5rem",
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            width: "100%",
                            borderRadius: "4px",
                            transition: "color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
                            e.currentTarget.style.color = "var(--brand-gold)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}