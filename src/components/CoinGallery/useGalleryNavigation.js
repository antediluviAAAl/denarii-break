/* src/components/CoinGallery/useGalleryNavigation.js */
"use client";

import { useState, useEffect } from "react";

export function useGalleryNavigation({
  viewMode,
  loading,
  virtualRows,
  rowVirtualizer,
  expandedCategories,
  setExpandedCategories,
  collapsedPeriods,
  setCollapsedPeriods,
  tocRefs,
}) {
  const [pendingScroll, setPendingScroll] = useState(null);

  // --- 1. THE TRIGGER ---
  // Called when user clicks a link in the Table of Contents
  const handleScrollTo = (groupId, periodId) => {
    // A. Force expand the category if it's closed
    if (!expandedCategories[groupId]) {
      setExpandedCategories((prev) => ({ ...prev, [groupId]: true }));
    }

    // B. Ensure period is not collapsed
    const periodKey = `${groupId}-${periodId}`;
    if (collapsedPeriods[periodKey]) {
      setCollapsedPeriods((prev) => {
        const next = { ...prev };
        delete next[periodKey];
        return next;
      });
    }

    // C. Set intention to scroll
    setPendingScroll({ groupId, periodId });
  };

  // --- 2. THE EFFECT ---
  // Watches for when the UI is ready (expanded & rendered) to perform the scroll
  useEffect(() => {
    if (!pendingScroll || loading) return;

    // SCENARIO A: Table Mode (Standard DOM Scroll)
    if (viewMode === "table") {
      if (!tocRefs || !tocRefs.current) return;
      
      const key = `period-${pendingScroll.groupId}-${pendingScroll.periodId}`;
      const element = tocRefs.current[key];

      if (element) {
        // FIX: Scroll to 'start', relying on CSS scroll-margin-top for offset
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setPendingScroll(null);
      }
      return;
    }

    // SCENARIO B: Virtual Mode (Grid/List)
    const index = virtualRows.findIndex(
      (r) =>
        r.type === "subheader" &&
        r.groupId === pendingScroll.groupId &&
        r.periodId === pendingScroll.periodId
    );

    if (index !== -1) {
      // FIX: 'scrollToFn' in the hook handles the offset logic now.
      rowVirtualizer.scrollToIndex(index, { align: "start" });
      setPendingScroll(null);
    }
  }, [
    pendingScroll,
    viewMode,
    loading,
    virtualRows,
    rowVirtualizer,
    tocRefs,
  ]);

  return { handleScrollTo };
}