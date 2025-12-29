"use client";

import React, { memo } from "react";
import { Check, X, Minus } from "lucide-react";
import { useCoinTable } from "./useCoinTable";
import styles from "./CoinTable.module.css";

// --- MEMOIZED MATRIX COMPONENT ---
const CoinMatrix = memo(function CoinMatrix({
  years,
  denominations,
  matrix,
  hoverState,
  onCoinClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.stickyColLeft}>Year</th>
          {denominations.map((d) => (
            <th key={d.name}>
              {/* Responsive Labels */}
              <span className="denom-label-desktop">{d.name}</span>
              <span className="denom-label-mobile">
                {d.shorthand || d.name}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {years.map((year) => (
          <tr key={year}>
            <td className={`${styles.stickyColLeft} ${styles.yearCell}`}>
              {year > 0 ? year : "ND"}
            </td>

            {denominations.map((d) => {
              const denomName = d.name;
              const cellCoins = matrix[`${year}-${denomName}`];
              const hasCoins = cellCoins && cellCoins.length > 0;
              
              // Cell Coloring Logic
              const isMixed =
                hasCoins &&
                cellCoins.some((c) => c.is_owned) &&
                cellCoins.some((c) => !c.is_owned);
              const allOwned = hasCoins && cellCoins.every((c) => c.is_owned);

              let cellClass = styles.cellEmpty; // Default text color style (rarely used on td)
              let tdClass = styles.matrixCell; // Base TD class

              if (allOwned) tdClass += ` ${styles.owned}`;
              else if (isMixed) tdClass += ` ${styles.mixed}`;
              else if (hasCoins) tdClass += ` ${styles.unowned}`;

              // Multi-coin Logic
              const isMultiCoin = hasCoins && cellCoins.length > 1;

              return (
                <td
                  key={`${year}-${denomName}`}
                  className={tdClass}
                >
                  {hasCoins ? (
                    <div className={styles.multiCoinContainer}>
                      {cellCoins.map((coin) => {
                        const isSeriesHighlighted =
                          hoverState.seriesId &&
                          coin.series_id === hoverState.seriesId;

                        const isDimmed =
                          hoverState.seriesId && !isSeriesHighlighted;

                        let labelDesktop, labelMobile;

                        if (isMultiCoin) {
                          const subj = coin.subject
                            ? coin.subject.substring(0, 8)
                            : denomName;
                          labelDesktop = subj;
                          labelMobile = subj;
                        } else {
                          labelDesktop = denomName;
                          labelMobile = d.shorthand || denomName;
                        }

                        // Determine wrapper classes dynamically
                        let wrapperClass = styles.coinItemWrapper;
                        if (coin.is_owned) wrapperClass += ` ${styles.owned}`;
                        else wrapperClass += ` ${styles.unowned}`;
                        
                        if (isSeriesHighlighted) wrapperClass += ` ${styles.highlight}`;
                        if (isDimmed) wrapperClass += ` ${styles.dimmed}`;

                        return (
                          <div
                            key={coin.coin_id}
                            className={wrapperClass}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCoinClick(coin);
                            }}
                            onMouseEnter={(e) => onMouseEnter(e, coin)}
                            onMouseMove={onMouseMove}
                            onMouseLeave={onMouseLeave}
                          >
                            <div className={styles.coinItemContent}>
                              <span className={`${styles.cellDenomLabel} denom-label-desktop`}>
                                {labelDesktop}
                              </span>
                              <span className={`${styles.cellDenomLabel} denom-label-mobile`}>
                                {labelMobile}
                              </span>

                              {coin.is_owned ? (
                                <Check size={16} strokeWidth={3} />
                              ) : (
                                <X size={16} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className={styles.cellEmpty}>
                      <Minus size={12} />
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default function CoinTable({ coins, onCoinClick }) {
  const {
    years,
    denominations,
    matrix,
    hoverState,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
  } = useCoinTable(coins);

  if (coins.length === 0) return null;

  // Tooltip Helper
  const getTooltipImage = (side) => {
    if (!hoverState.coin) return null;
    return hoverState.coin.images?.[side]?.thumb;
  };

  const tooltipObverse = getTooltipImage("obverse");
  const tooltipReverse = getTooltipImage("reverse");

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <CoinMatrix
          years={years}
          denominations={denominations}
          matrix={matrix}
          hoverState={hoverState}
          onCoinClick={onCoinClick}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {hoverState.coin && (
        <div
          className={styles.hoverTooltip}
          style={{
            top: hoverState.y + 15,
            left: hoverState.x + 15,
          }}
        >
          <div className={styles.tooltipHeader}>
            <span className={styles.tooltipTitle}>{hoverState.coin.name}</span>
            <span className={styles.tooltipSeries}>
              {hoverState.coin.d_series?.series_range || "Unknown Range"}
            </span>
          </div>
          <div className={styles.tooltipImages}>
            {tooltipObverse ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tooltipObverse}
                alt="Obverse"
                className={styles.tooltipImg}
              />
            ) : (
              <div className={styles.tooltipPlaceholder}>No Obv</div>
            )}
            {tooltipReverse ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tooltipReverse}
                alt="Reverse"
                className={styles.tooltipImg}
              />
            ) : (
              <div className={styles.tooltipPlaceholder}>No Rev</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}