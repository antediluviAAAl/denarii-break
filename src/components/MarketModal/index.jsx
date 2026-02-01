/* src/components/MarketModal/index.jsx */
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
import { useMetalHistory } from "../../hooks/useMetalHistory";
import styles from "./MarketModal.module.css";

const RANGES = ["7D", "1M", "3M", "1Y", "3Y", "5Y"];
const POSITIVE_COLOR = "#10b981";
const NEGATIVE_COLOR = "#e11d48";
const GRAMS_PER_OUNCE = 31.1035;

export default function MarketModal({ onClose }) {
  const [range, setRange] = useState("3M");
  const [symbol, setSymbol] = useState("XAG");
  // UPDATED: Default to Grams ('g')
  const [unit, setUnit] = useState("g"); 

  // DRAG STATE
  const [refAreaLeft, setRefAreaLeft] = useState("");
  const [refAreaRight, setRefAreaRight] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);

  // DATA FETCHING
  const {
    data,
    loading,
    currentPrice: rawCurrentPrice,
    minPrice: rawMinPrice,
    maxPrice: rawMaxPrice,
    percentChange,
    isPositive,
  } = useMetalHistory(symbol, range, true);

  // --- UNIT CONVERSION LOGIC ---
  const convert = (val) => (unit === "g" ? val / GRAMS_PER_OUNCE : val);

  // Apply conversion to aggregate stats
  const currentPrice = convert(rawCurrentPrice);
  const minPrice = convert(rawMinPrice);
  const maxPrice = convert(rawMaxPrice);

  // Helper: Dynamic Precision for Grams (Silver < $1 needs 3 decimals)
  const formatCurrency = (val) => {
    if (unit === "g" && val < 10) return `$${val.toFixed(3)}`;
    return `$${val.toFixed(2)}`;
  };

  const mainColor = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;
  
  // Padding prevents line from hitting top/bottom edge
  const padding = (maxPrice - minPrice) * 0.1;

  // --- SELECTION LOGIC ---
  let selectionStats = null;
  let chartData = [];
  let selectionColor = mainColor;

  // Apply conversion to the full dataset on every render
  chartData = data.map((d) => ({
    ...d,
    price: convert(d.price),
  }));

  const indexLeft = chartData.findIndex((d) => d.date === refAreaLeft);
  const indexRight = chartData.findIndex((d) => d.date === refAreaRight);
  const hasSelection =
    indexLeft !== -1 && indexRight !== -1 && refAreaLeft !== refAreaRight;

  if (hasSelection) {
    const minIdx = Math.min(indexLeft, indexRight);
    const maxIdx = Math.max(indexLeft, indexRight);

    const selStart = chartData[minIdx].price;
    const selEnd = chartData[maxIdx].price;
    const selChange = ((selEnd - selStart) / selStart) * 100;
    const selPositive = selChange >= 0;

    selectionColor = selPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;

    selectionStats = {
      start: selStart,
      end: selEnd,
      change: selChange,
      isPos: selPositive,
      startDate: chartData[minIdx].date,
      endDate: chartData[maxIdx].date,
    };

    // Overlay Data
    chartData = chartData.map((d, i) => ({
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

  const titleMap = {
    XAG: "Silver Spot Price",
    XAU: "Gold Spot Price",
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.headerMain}>
            
            <div className={styles.controlsRow}>
              {/* METAL TOGGLE */}
              <div className={styles.toggleContainer}>
                <button
                  onClick={() => setSymbol("XAG")}
                  className={`${styles.toggleBtn} ${
                    symbol === "XAG" ? styles.activeSilver : ""
                  }`}
                >
                  SILVER
                </button>
                <button
                  onClick={() => setSymbol("XAU")}
                  className={`${styles.toggleBtn} ${
                    symbol === "XAU" ? styles.activeGold : ""
                  }`}
                >
                  GOLD
                </button>
              </div>

              {/* UNIT TOGGLE */}
              <div className={styles.toggleContainer}>
                <button
                  onClick={() => setUnit("oz")}
                  className={`${styles.toggleBtn} ${
                    unit === "oz" ? styles.activeUnit : ""
                  }`}
                >
                  OUNCE
                </button>
                <button
                  onClick={() => setUnit("g")}
                  className={`${styles.toggleBtn} ${
                    unit === "g" ? styles.activeUnit : ""
                  }`}
                >
                  GRAM
                </button>
              </div>
            </div>

            {/* FIXED TITLE: Always shows (Symbol/USD) regardless of Gram selection */}
            <h3 className={styles.modalTitle}>
              {titleMap[symbol]} ({symbol}/USD)
            </h3>

            <div className={styles.statsRow}>
              {/* GLOBAL STATS */}
              <div className={styles.globalStats}>
                {loading && data.length === 0 ? (
                  <div className="animate-pulse h-8 w-32 bg-gray-200 rounded" />
                ) : (
                  <>
                    <span className={styles.currentPrice}>
                      {formatCurrency(currentPrice)}
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

              {/* SELECTION STATS */}
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
          {loading && data.length === 0 && (
            <div className={styles.loaderContainer}>
              <Loader2 className="animate-spin" size={32} />
              <span>Fetching market data...</span>
            </div>
          )}

          {/* Faint overlay when switching metals */}
          {loading && data.length > 0 && (
            <div className={styles.loadingOverlay}>
              <Loader2 className="animate-spin text-gray-500" size={24} />
            </div>
          )}

          {data.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mainColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="colorSelection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectionColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={selectionColor} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" hide />
                
                {/* Auto-Scale YAxis */}
                <YAxis 
                  hide 
                  domain={[minPrice - padding, maxPrice + padding]} 
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fff",
                  }}
                  itemStyle={{ fontWeight: 600, color: "#1f2937" }}
                  // Grey text for Dark Mode date visibility
                  labelStyle={{ 
                    color: "#6b7280", 
                    fontSize: "0.75rem", 
                    marginBottom: "0.25rem" 
                  }}
                  formatter={(value) => [formatCurrency(value)]}
                  cursor={{
                    stroke: "#9ca3af",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={mainColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={500}
                />

                <Area
                  type="monotone"
                  dataKey="selectionPrice"
                  stroke={selectionColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSelection)"
                  animationDuration={300}
                  connectNulls
                  tooltipType="none" // Prevent duplicate tooltip entry
                />

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