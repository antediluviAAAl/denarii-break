"use client";

import React from "react";
import Link from "next/link";
import { Calendar, DollarSign, Hash, Eye } from "lucide-react";
import FadeInImage from "../FadeInImage";
import styles from "./CoinCard.module.css";

const buildSrcSet = (imgObj) => {
  if (!imgObj) return undefined;
  const variants = [];
  if (imgObj.thumb) variants.push(`${imgObj.thumb} 150w`);
  if (imgObj.medium) variants.push(`${imgObj.medium} 600w`);
  if (imgObj.original || imgObj.full)
    variants.push(`${imgObj.original || imgObj.full} 1200w`);
  return variants.join(", ") || undefined;
};

export default function CoinCard({ coin }) {
  const obverseUrl =
    coin.images?.obverse?.medium || coin.images?.obverse?.original;
  const reverseUrl =
    coin.images?.reverse?.medium || coin.images?.reverse?.original;
  const obverseSrcSet = buildSrcSet(coin.images?.obverse);
  const reverseSrcSet = buildSrcSet(coin.images?.reverse);
  const denomination = coin.d_denominations?.denomination_name;

  return (
    <div className={`${styles.coinCard} ${coin.is_owned ? styles.owned : ""}`}>
      <Link href={`/coin/${coin.coin_id}`} className={styles.cardLink}>
        <div className={styles.cardFlipper}>
          {/* FRONT */}
          <div className={styles.cardFront}>
            {coin.marked && (
              <div className={`${styles.cardBadge} ${styles.badgeRare}`}>
                RARE
              </div>
            )}
            {denomination && (
              <div className={`${styles.cardBadge} ${styles.badgeDenom}`}>
                {denomination}
              </div>
            )}

            <div className={styles.coinCardInner}>
              <div className={styles.coinImageContainer}>
                {obverseUrl ? (
                  <FadeInImage
                    src={obverseUrl}
                    srcSet={obverseSrcSet}
                    sizes="(max-width: 768px) 100vw, 300px"
                    alt={coin.name}
                    fill
                    className={styles.coinImage}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  /* REMOVED TEXT HERE */
                  <div className={styles.placeholder} />
                )}
              </div>

              <div className={styles.coinDetails}>
                <h3 className={styles.coinName} title={coin.name}>
                  {coin.name}
                </h3>

                <div className={styles.coinInfo}>
                  <div className={styles.coinInfoItem}>
                    <Calendar size={14} />
                    <span>{coin.year || "?"}</span>
                  </div>
                  <div className={styles.coinInfoItem}>
                    <DollarSign size={14} />
                    <span>
                      {coin.price_usd ? `$${coin.price_usd.toFixed(2)}` : "N/A"}
                    </span>
                  </div>
                  {coin.km && (
                    <div className={styles.coinInfoItem}>
                      <Hash size={14} />
                      <span>{coin.km}</span>
                    </div>
                  )}
                </div>

                {coin.subject && (
                  <p className={styles.coinSubject}>{coin.subject}</p>
                )}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className={styles.cardBack}>
            <div className={styles.backContentWrapper}>
              {reverseUrl ? (
                <FadeInImage
                  src={reverseUrl}
                  srcSet={reverseSrcSet}
                  sizes="(max-width: 768px) 100vw, 300px"
                  alt={`${coin.name} Reverse`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={styles.noReversePlaceholder} />
              )}
              <div className={styles.cardBackOverlay}>
                <Eye size={20} />
                <span>View Details</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
