"use client";

import { useMemo, useState } from "react";

/**
 * Custom hook to manage logic for the CoinTable.
 * Pivots flat coin data into a Year vs. Denomination matrix.
 */
export function useCoinTable(coins) {
  // 1. Hover State for Tooltip interactions
  const [hoverState, setHoverState] = useState({
    coin: null,
    seriesId: null,
    x: 0,
    y: 0,
  });

  const handleMouseEnter = (e, coin) => {
    const { clientX, clientY } = e;
    setHoverState({
      coin,
      seriesId: coin.series_id,
      x: clientX,
      y: clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (hoverState.coin) {
      setHoverState((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }));
    }
  };

  const handleMouseLeave = () => {
    setHoverState({
      coin: null,
      seriesId: null,
      x: 0,
      y: 0,
    });
  };

  // 2. Data Transformation (The Matrix Pivot)
  const { years, denominations, matrix } = useMemo(() => {
    const yearsSet = new Set();
    const denomMap = new Map(); // Store objects { name, shorthand }
    const lookup = {};

    coins.forEach((coin) => {
      const y = coin.year || 0;
      const dName = coin.d_denominations?.denomination_name || "Unknown";
      const dShort = coin.d_denominations?.denomination_shorthand || "";

      yearsSet.add(y);
      // Only set if not already present to avoid duplicates
      if (!denomMap.has(dName)) {
        denomMap.set(dName, { name: dName, shorthand: dShort });
      }

      const key = `${y}-${dName}`;
      if (!lookup[key]) {
        lookup[key] = [];
      }
      lookup[key].push(coin);
    });

    // Sort coins within a cell (Subject, then Owned status)
    Object.keys(lookup).forEach((key) => {
      lookup[key].sort((a, b) => {
        if (a.is_owned === b.is_owned) {
          return (a.subject || "").localeCompare(b.subject || "");
        }
        return b.is_owned - a.is_owned;
      });
    });

    // Sort Years Descending
    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
    
    // Sort denominations numerically then alphabetically
    const sortedDenoms = Array.from(denomMap.values()).sort((a, b) => {
      const numA = parseFloat(a.name) || 0;
      const numB = parseFloat(b.name) || 0;
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    });

    return {
      years: sortedYears,
      denominations: sortedDenoms,
      matrix: lookup,
    };
  }, [coins]);

  return {
    years,
    denominations,
    matrix,
    hoverState,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  };
}