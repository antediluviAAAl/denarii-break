"use client";

import React, { memo } from "react";
import Link from "next/link"; // Import Link
import { Check, X, Minus } from "lucide-react";
import { useCoinTable } from "./useCoinTable";
import styles from "./CoinTable.module.css";

const CoinMatrix = memo(function CoinMatrix({
  years,
  denominations,
  matrix,
  hoverState,
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

              const isMixed =
                hasCoins &&
                cellCoins.some((c) => c.is_owned) &&
                cellCoins.some((c) => !c.is_owned);
              const allOwned = hasCoins && cellCoins.every((c) => c.is_owned);

              let tdClass = styles.matrixCell;
              if (allOwned) tdClass += ` ${styles.owned}`;
              else if (isMixed) tdClass += ` ${styles.mixed}`;
              else if (hasCoins) tdClass += ` ${styles.unowned}`;

              const isMultiCoin = hasCoins && cellCoins.length > 1;

              return (
                <td key={`${year}-${denomName}`} className={tdClass}>
                  {hasCoins ? (
                    <div className={styles.multiCoinContainer}>
                      {cellCoins.map((coin) => {
                        const isSeriesHighlighted =
                          hoverState.seriesId &&
                          coin.series_id === hoverState.seriesId;
                        const isDimmed =
                          hoverState.seriesId && !isSeriesHighlighted;

                        let labelDesktop = isMultiCoin
                          ? coin.subject
                            ? coin.subject.substring(0, 8)
                            : denomName
                          : denomName;
                        let labelMobile = isMultiCoin
                          ? labelDesktop
                          : d.shorthand || denomName;

                        let wrapperClass = styles.coinItemWrapper;
                        if (coin.is_owned) wrapperClass += ` ${styles.owned}`;
                        else wrapperClass += ` ${styles.unowned}`;
                        if (isSeriesHighlighted)
                          wrapperClass += ` ${styles.highlight}`;
                        if (isDimmed) wrapperClass += ` ${styles.dimmed}`;

                        return (
                          // WRAPPER LINK
                          <Link
                            key={coin.coin_id}
                            href={`/coin/${coin.coin_id}`}
                            className={wrapperClass}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                              display: "flex",
                            }}
                            onMouseEnter={(e) => onMouseEnter(e, coin)}
                            onMouseMove={onMouseMove}
                            onMouseLeave={onMouseLeave}
                          >
                            <div className={styles.coinItemContent}>
                              <span
                                className={`${styles.cellDenomLabel} denom-label-desktop`}
                              >
                                {labelDesktop}
                              </span>
                              <span
                                className={`${styles.cellDenomLabel} denom-label-mobile`}
                              >
                                {labelMobile}
                              </span>
                              {coin.is_owned ? (
                                <Check size={16} strokeWidth={3} />
                              ) : (
                                <X size={16} />
                              )}
                            </div>
                          </Link>
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

export default function CoinTable({ coins }) {
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

  const tooltipObverse = hoverState.coin?.images?.obverse?.thumb;
  const tooltipReverse = hoverState.coin?.images?.reverse?.thumb;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <CoinMatrix
          years={years}
          denominations={denominations}
          matrix={matrix}
          hoverState={hoverState}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {hoverState.coin && (
        <div
          className={styles.hoverTooltip}
          style={{ top: hoverState.y + 15, left: hoverState.x + 15 }}
        >
          <div className={styles.tooltipHeader}>
            <span className={styles.tooltipTitle}>{hoverState.coin.name}</span>
            <span className={styles.tooltipSeries}>
              {hoverState.coin.d_series?.series_range || "Unknown Range"}
            </span>
          </div>
          <div className={styles.tooltipImages}>
            {tooltipObverse ? (
              <img
                src={tooltipObverse}
                alt="Obv"
                className={styles.tooltipImg}
              />
            ) : (
              <div className={styles.tooltipPlaceholder}>No Obv</div>
            )}
            {tooltipReverse ? (
              <img
                src={tooltipReverse}
                alt="Rev"
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
