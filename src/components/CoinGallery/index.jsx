"use client";

import React from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import CoinCard from "../CoinCard";
import CoinTable from "../CoinTable";
import CoinListItem from "../CoinListItem";
import PeriodHeader from "./PeriodHeader";
import { useCoinGallery } from "./useCoinGallery";
import styles from "./CoinGallery.module.css";

export default function CoinGallery({
  coins,
  loading,
  categories,
  onCoinClick,
  viewMode,
  setViewMode,
  sortBy,
}) {
  const {
    parentRef,
    columns,
    groupedCoins,
    expandedCategories,
    collapsedPeriods,
    virtualRows,
    rowVirtualizer,
    toggleCategory,
    togglePeriod,
    getCoinsByPeriod,
  } = useCoinGallery({ coins, categories, loading, viewMode, sortBy });

  const handleRowBackgroundClick = (e, groupId) => {
    // Only toggle if clicking background, not interactive elements
    if (
      e.target === e.currentTarget ||
      e.target.classList.contains(styles.virtualRow) ||
      e.target.classList.contains(styles.virtualSpacer) ||
      e.target.classList.contains(styles.virtualRowContainer)
    ) {
      toggleCategory(groupId);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={`${styles.spinner} animate-spin`} />
        <p>Loading collection...</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={styles.galleryContainer}
      // Forces full re-render on view switch to clear height cache
      key={viewMode}
    >
      {viewMode === "table" ? (
        /* --- TABLE MODE --- */
        <div>
          {groupedCoins.map((group) => {
            const catOwnedCount = group.coins.filter((c) => c.is_owned).length;
            const isCategoryExpanded = expandedCategories[group.id];

            return (
              <div
                key={group.id}
                className={styles.categorySection}
                style={{
                  border: "none",
                  overflow: "visible",
                }}
              >
                <div
                  className={styles.categoryHeader}
                  onClick={() => toggleCategory(group.id)}
                  style={{
                    backgroundColor: group.color.bg,
                    border: `1px solid ${group.color.border}`,
                    // FIX: Use transparent border instead of 'none' to prevent height jump/text shift
                    borderBottom: isCategoryExpanded
                      ? "1px solid transparent"
                      : `1px solid ${group.color.border}`,
                    borderRadius: isCategoryExpanded ? "12px 12px 0 0" : "12px",
                  }}
                >
                  <div className={styles.categoryTitle}>
                    <h2
                      className={styles.categoryName}
                      style={{ color: group.color.text }}
                    >
                      {group.name}
                    </h2>
                    <span className={styles.categoryCount}>
                      <span className="text-gold">
                        {group.coins.length} coins
                      </span>
                      <span className={styles.ownedInCategory}>
                        • {catOwnedCount} owned
                      </span>
                    </span>
                  </div>
                  <button className={styles.categoryToggle}>
                    {isCategoryExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>

                {isCategoryExpanded && (
                  <div
                    className={styles.categoryContentTable}
                    onClick={(e) => handleRowBackgroundClick(e, group.id)}
                    title="Click background to collapse category"
                    style={{
                      borderLeft: `1px solid ${group.color.border}`,
                      borderRight: `1px solid ${group.color.border}`,
                      borderBottom: `1px solid ${group.color.border}`,
                    }}
                  >
                    {getCoinsByPeriod(group.coins, true).map((periodGroup) => {
                      const periodOwnedCount = periodGroup.coins.filter(
                        (c) => c.is_owned
                      ).length;
                      const uniqueKey = `${group.id}-${periodGroup.id}`;
                      const isPeriodExpanded = !collapsedPeriods[uniqueKey];

                      return (
                        <div
                          key={periodGroup.id}
                          className={styles.periodGroupTable}
                        >
                          <div
                            className={styles.periodRowTable}
                            onClick={() =>
                              togglePeriod(group.id, periodGroup.id)
                            }
                          >
                            <PeriodHeader
                              title={periodGroup.name}
                              count={periodGroup.coins.length}
                              ownedCount={periodOwnedCount}
                              isExpanded={isPeriodExpanded}
                              borderColor={group.color.border}
                            />
                          </div>

                          {isPeriodExpanded && (
                            <div className={styles.periodContentWrapper}>
                              <CoinTable
                                coins={periodGroup.coins}
                                onCoinClick={onCoinClick}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* --- GRID & LIST MODE (Virtualized) --- */
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const row = virtualRows[virtualItem.index];
            if (!row) return null;

            const groupColor =
              row.type === "header"
                ? row.group.color
                : groupedCoins.find((g) => g.id === row.groupId)?.color;
            const borderColor = groupColor ? groupColor.border : "#e5e7eb";

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${
                    virtualItem.start - rowVirtualizer.options.scrollMargin
                  }px)`,
                }}
              >
                {/* 1. CATEGORY HEADER */}
                {row.type === "header" ? (
                  <div
                    className={styles.categorySection}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      overflow: "visible",
                      zIndex: 2,
                      position: "relative",
                    }}
                  >
                    <div
                      className={styles.categoryHeader}
                      onClick={() => toggleCategory(row.group.id)}
                      style={{
                        backgroundColor: row.group.color.bg,
                        border: `1px solid ${borderColor}`,
                        // FIX: Transparent border for consistent height (no text shift)
                        borderBottom: expandedCategories[row.group.id]
                          ? "1px solid transparent"
                          : `1px solid ${borderColor}`,
                        borderRadius: expandedCategories[row.group.id]
                          ? "12px 12px 0 0"
                          : "12px",
                      }}
                    >
                      <div className={styles.categoryTitle}>
                        <h2
                          className={styles.categoryName}
                          style={{ color: row.group.color.text }}
                        >
                          {row.group.name}
                        </h2>
                        <span className={styles.categoryCount}>
                          <span className="text-gold">
                            {row.group.coins.length} coins
                          </span>
                          <span className={styles.ownedInCategory}>
                            • {row.group.coins.filter((c) => c.is_owned).length}{" "}
                            owned
                          </span>
                        </span>
                      </div>
                      <button className={styles.categoryToggle}>
                        {expandedCategories[row.group.id] ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                ) : row.type === "subheader" ? (
                  /* 2. PERIOD SUB-HEADER */
                  <div
                    className={styles.periodRowTable}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePeriod(row.groupId, row.periodId);
                    }}
                    style={{
                      borderLeft: `1px solid ${borderColor}`,
                      borderRight: `1px solid ${borderColor}`,
                      borderBottom: row.isLastInGroup
                        ? `1px solid ${borderColor}`
                        : "none",
                      borderRadius: row.isLastInGroup ? "0 0 12px 12px" : "0",
                      height: "auto",
                      minHeight: "50px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <PeriodHeader
                      title={row.title}
                      count={row.count}
                      ownedCount={row.ownedCount}
                      isExpanded={row.isExpanded}
                      borderColor={borderColor}
                    />
                  </div>
                ) : (
                  /* 3. COIN ROW */
                  <div
                    className={styles.virtualRowContainer}
                    onClick={(e) => handleRowBackgroundClick(e, row.groupId)}
                    title="Click background to collapse category"
                    style={{
                      borderLeft: `1px solid ${borderColor}`,
                      borderRight: `1px solid ${borderColor}`,
                      borderBottom: row.isLast
                        ? `1px solid ${borderColor}`
                        : "none",
                      borderRadius: row.isLast ? "0 0 12px 12px" : "0",
                    }}
                  >
                    <div className={styles.virtualRow}>
                      {row.coins.map((coin) =>
                        viewMode === "list" ? (
                          <CoinListItem
                            key={coin.coin_id}
                            coin={coin}
                            onClick={onCoinClick}
                          />
                        ) : (
                          <CoinCard
                            key={coin.coin_id}
                            coin={coin}
                            onClick={onCoinClick}
                          />
                        )
                      )}
                      {viewMode === "grid" &&
                        Array.from({ length: columns - row.coins.length }).map(
                          (_, i) => (
                            <div
                              key={`spacer-${i}`}
                              className={styles.virtualSpacer}
                            />
                          )
                        )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
