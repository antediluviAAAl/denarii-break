/* src/components/CoinGallery/useCoinGallery.js */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useWindowSize } from "../../hooks/useWindowSize";

const CATEGORY_COLORS = [
  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  { bg: "#f3e8ff", border: "#8b5cf6", text: "#5b21b6" },
  { bg: "#f1f5f9", border: "#94a3b8", text: "#475569" },
];

export function useCoinGallery({
  coins,
  categories,
  loading,
  viewMode,
  sortBy,
}) {
  const { width } = useWindowSize();
  const parentRef = useRef(null);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    if (parentRef.current) {
      setOffsetTop(parentRef.current.offsetTop);
    }
  }, [width, coins.length, viewMode]);

  // --- 1. COLUMNS ---
  const columns = useMemo(() => {
    if (viewMode === "list") return 1;
    if (width < 650) return 1;
    if (width < 950) return 2;
    if (width < 1300) return 3;
    return 4;
  }, [width, viewMode]);

  // --- 2. CATEGORY GROUPING ---
  const groupedCoins = useMemo(() => {
    const groupsMap = {};
    categories.forEach((cat, index) => {
      groupsMap[cat.type_id] = {
        id: cat.type_id,
        name: cat.type_name,
        coins: [],
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
    });

    const uncategorizedId = "uncategorized";
    coins.forEach((coin) => {
      let targetGroup = groupsMap[coin.type_id];
      if (!targetGroup) {
        if (!groupsMap[uncategorizedId]) {
          groupsMap[uncategorizedId] = {
            id: uncategorizedId,
            name: "Uncategorized",
            coins: [],
            color: CATEGORY_COLORS[5],
          };
        }
        targetGroup = groupsMap[uncategorizedId];
      }
      targetGroup.coins.push(coin);
    });

    return Object.values(groupsMap)
      .filter((g) => g.coins.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [coins, categories]);

  // --- 3. EXPANSION ---
  const [expandedCategories, setExpandedCategories] = useState({});
  const toggleCategory = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [collapsedPeriods, setCollapsedPeriods] = useState({});
  const togglePeriod = (categoryId, periodId) => {
    const key = `${categoryId}-${periodId}`;
    setCollapsedPeriods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- 4. PERIOD GROUPING ---
  const getCoinsByPeriod = (categoryCoins) => {
    const periodMap = {};
    const noPeriodKey = "no_period";

    // A. Group Coins
    categoryCoins.forEach((c) => {
      const pid = c.period_id || noPeriodKey;
      if (!periodMap[pid]) {
        periodMap[pid] = {
          id: pid,
          name: c.d_period?.period_name || "General Issues",
          startYear: c.d_period?.period_start_year || 0,
          coins: [],
          stats: {
            minYear: 9999,
            maxYear: -9999,
            maxPrice: 0,
            minPrice: 9999999,
          },
        };
      }
      const group = periodMap[pid];
      group.coins.push(c);

      // Collect stats
      const y = c.year || 0;
      const p = c.price_usd || 0;
      if (y < group.stats.minYear) group.stats.minYear = y;
      if (y > group.stats.maxYear) group.stats.maxYear = y;
      if (p > group.stats.maxPrice) group.stats.maxPrice = p;
      if (p < group.stats.minPrice) group.stats.minPrice = p;
    });

    // B. Sort Periods
    const sortedPeriods = Object.values(periodMap).sort((a, b) => {
      if (sortBy === "price_desc") {
        const valA = a.stats.maxPrice;
        const valB = b.stats.maxPrice;
        if (valA !== valB) return valB - valA;
      } else if (sortBy === "price_asc") {
        const valA = a.stats.minPrice === 9999999 ? 0 : a.stats.minPrice;
        const valB = b.stats.minPrice === 9999999 ? 0 : b.stats.minPrice;
        if (valA !== valB) return valA - valB;
      } else if (sortBy === "year_asc") {
        const valA = a.stats.minYear;
        const valB = b.stats.minYear;
        if (valA !== valB) return valA - valB;
      } else {
        const valA = a.stats.maxYear;
        const valB = b.stats.maxYear;
        if (valA !== valB) return valB - valA;
      }
      return b.startYear - a.startYear;
    });

    // C. Sort Coins
    sortedPeriods.forEach((p) => {
      p.coins.sort((coinA, coinB) => {
        const yearA = coinA.year || 0;
        const yearB = coinB.year || 0;
        const priceA = coinA.price_usd || 0;
        const priceB = coinB.price_usd || 0;

        if (sortBy === "year_asc") return yearA - yearB;
        if (sortBy === "year_desc") return yearB - yearA;
        if (sortBy === "price_desc") return priceB - priceA;
        if (sortBy === "price_asc") return priceA - priceB;
        return yearB - yearA;
      });
    });

    return sortedPeriods;
  };

  // --- 5. VIRTUAL ROWS ---
  const virtualRows = useMemo(() => {
    if (loading || viewMode === "table") return [];
    const rows = [];

    groupedCoins.forEach((group) => {
      rows.push({ type: "header", group });

      if (expandedCategories[group.id]) {
        const periodGroups = getCoinsByPeriod(group.coins);

        periodGroups.forEach((period, pIndex) => {
          const uniqueKey = `${group.id}-${period.id}`;
          const isPeriodExpanded = !collapsedPeriods[uniqueKey];
          const isLastPeriod = pIndex === periodGroups.length - 1;
          const isLastVisualElement = isLastPeriod && !isPeriodExpanded;

          rows.push({
            type: "subheader",
            title: period.name,
            count: period.coins.length,
            ownedCount: period.coins.filter((c) => c.is_owned).length,
            groupId: group.id,
            periodId: period.id,
            isExpanded: isPeriodExpanded,
            isLastInGroup: isLastVisualElement,
          });

          if (isPeriodExpanded) {
            for (let i = 0; i < period.coins.length; i += columns) {
              const isLastRowInPeriod = i + columns >= period.coins.length;
              rows.push({
                type: "row",
                coins: period.coins.slice(i, i + columns),
                groupId: group.id,
                isLast: isLastPeriod && isLastRowInPeriod,
              });
            }
          }
        });
      }
    });
    return rows;
  }, [
    groupedCoins,
    expandedCategories,
    collapsedPeriods,
    columns,
    loading,
    viewMode,
    sortBy,
  ]);

  const rowVirtualizer = useWindowVirtualizer({
    count: virtualRows.length,
    estimateSize: (index) => {
      const row = virtualRows[index];
      if (row.type === "header") return 70;
      if (row.type === "subheader") return 50;
      if (viewMode === "list") return width < 768 ? 95 : 100;
      return 380;
    },
    overscan: 5,
    scrollMargin: offsetTop,
    // --- NEW: Custom Scroll Function (The "Bespoke Logic") ---
    scrollToFn: (offset, canSmooth, instance) => {
      window.scrollTo({
        top: offset - 80, // Subtract Header Height
        behavior: canSmooth ? "smooth" : "auto",
      });
    },
  });

  return {
    parentRef,
    columns,
    groupedCoins,
    expandedCategories,
    setExpandedCategories, // Exported for Nav
    collapsedPeriods,
    setCollapsedPeriods,   // Exported for Nav
    virtualRows,
    rowVirtualizer,
    toggleCategory,
    togglePeriod,
    getCoinsByPeriod,
  };
}