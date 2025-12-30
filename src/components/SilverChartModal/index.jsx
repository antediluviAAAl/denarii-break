/* src/components/SilverChartModal/index.jsx */
"use client";

import React, { useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Loader2,
  MousePointerClick,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useSilverHistory } from "../../hooks/useSilverHistory";
import styles from "./SilverChartModal.module.css";

// Updated Ranges (Removed 10Y and ALL)
const RANGES = ["7D", "1M", "3M", "1Y", "3Y", "5Y"];

const POSITIVE_COLOR = "#10b981";
const NEGATIVE_COLOR = "#e11d48";

export default function SilverChartModal({ onClose }) {
  const [range, setRange] = useState("3M");

  // DRAG STATE
  const [refAreaLeft, setRefAreaLeft] = useState("");
  const [refAreaRight, setRefAreaRight] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);

  const {
    data,
    loading,
    currentPrice,
    minPrice,
    maxPrice,
    percentChange,
    isPositive,
  } = useSilverHistory(range, true);

  const mainColor = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;
  const padding = (maxPrice - minPrice) * 0.1;

  // --- SELECTION CALCULATIONS ---
  let selectionStats = null;
  let chartData = data;
  let selectionColor = mainColor;

  const indexLeft = data.findIndex((d) => d.date === refAreaLeft);
  const indexRight = data.findIndex((d) => d.date === refAreaRight);
  const hasSelection =
    indexLeft !== -1 && indexRight !== -1 && refAreaLeft !== refAreaRight;

  if (hasSelection) {
    const minIdx = Math.min(indexLeft, indexRight);
    const maxIdx = Math.max(indexLeft, indexRight);

    const selStart = data[minIdx].price;
    const selEnd = data[maxIdx].price;
    const selChange = ((selEnd - selStart) / selStart) * 100;
    const selPositive = selChange >= 0;

    selectionColor = selPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;

    selectionStats = {
      start: selStart,
      end: selEnd,
      change: selChange,
      isPos: selPositive,
      startDate: data[minIdx].date,
      endDate: data[maxIdx].date,
    };

    // Prepare Data for "Selection Line Overlay"
    chartData = data.map((d, i) => ({
      ...d,
      selectionPrice: i >= minIdx && i <= maxIdx ? d.price : null,
    }));
  }

  // --- MOUSE HANDLERS ---
  const handleMouseDown = (e) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setRefAreaRight(e.activeLabel);
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isSelecting && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    if (refAreaLeft === refAreaRight) {
      setRefAreaLeft("");
      setRefAreaRight("");
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.headerMain}>
            <h3 className={styles.modalTitle}>Silver Spot Price (XAG/USD)</h3>

            <div className={styles.statsRow}>
              {/* 1. LEFT: GLOBAL STATS */}
              <div className={styles.globalStats}>
                {loading && data.length === 0 ? (
                  <div className={styles.skeletonPrice} />
                ) : (
                  <>
                    <span className={styles.currentPrice}>
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span
                      className={`${styles.percentBadge} ${
                        isPositive ? styles.positive : styles.negative
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {Math.abs(percentChange).toFixed(2)}%
                    </span>
                  </>
                )}
              </div>

              {/* 2. RIGHT: SELECTION STATS */}
              {selectionStats ? (
                <div className={styles.selectionStats}>
                  <div className={styles.selectionLabel}>
                    Selected ({selectionStats.startDate} -{" "}
                    {selectionStats.endDate})
                  </div>
                  <div className={styles.selectionValues}>
                    <span
                      className={`${styles.percentBadge} ${
                        selectionStats.isPos ? styles.positive : styles.negative
                      }`}
                    >
                      {selectionStats.isPos ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {Math.abs(selectionStats.change).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex text-xs text-gray-400 items-center gap-1 self-end mb-1 animate-pulse">
                  <MousePointerClick size={12} />
                  <span>Drag chart to analyze</span>
                </div>
              )}
            </div>
          </div>

          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* CHART BODY */}
        <div className={styles.modalBody}>
          {loading && data.length === 0 ? (
            <div className={styles.loaderContainer}>
              <Loader2 className="animate-spin" size={32} />
              <span>Fetching market data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 15, left: 15, bottom: 5 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={mainColor}
                      stopOpacity={0.15}
                    />
                    <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="colorSelection"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={selectionColor}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={selectionColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" hide />
                <YAxis hide domain={[minPrice - padding, maxPrice + padding]} />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fff",
                  }}
                  itemStyle={{ fontWeight: 600, color: "#1f2937" }}
                  labelStyle={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    fontFamily: "var(--font-cinzel)",
                    marginBottom: "0.25rem",
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`]}
                  cursor={{
                    stroke: "#9ca3af",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />

                {/* LAYER 1: Base Chart */}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={mainColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={500}
                />

                {/* LAYER 2: Selection Overlay */}
                <Area
                  type="monotone"
                  dataKey="selectionPrice"
                  stroke={selectionColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSelection)"
                  animationDuration={300}
                  connectNulls
                  tooltipType="none"
                />

                {/* LAYER 3: The "Curtain" */}
                {refAreaLeft && refAreaRight && (
                  <ReferenceArea
                    x1={refAreaLeft}
                    x2={refAreaRight}
                    strokeOpacity={0.3}
                    fill={selectionColor}
                    fillOpacity={0.15}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.modalFooter}>
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setRefAreaLeft("");
                setRefAreaRight("");
              }}
              className={`${styles.rangeBtn} ${
                range === r ? styles.active : ""
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
