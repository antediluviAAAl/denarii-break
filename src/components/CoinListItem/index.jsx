"use client";
import React, { memo } from "react";
import { Calendar, DollarSign, Hash, CheckCircle } from "lucide-react";
import FadeInImage from "../FadeInImage";
import styles from "./CoinListItem.module.css";

/**
 * Helper to build srcset string (lighter version for list items)
 */
const buildListSrcSet = (imgObj) => {
  if (!imgObj) return undefined;
  const variants = [];
  // Prioritize thumb for list view
  if (imgObj.thumb) variants.push(`${imgObj.thumb} 150w`);
  if (imgObj.medium) variants.push(`${imgObj.medium} 600w`);
  return variants.join(", ") || undefined;
};

const CoinListItem = memo(function CoinListItem({ coin, onClick }) {
  // --- Data Preparation ---
  const obverseUrl =
    coin.images?.obverse?.thumb || coin.images?.obverse?.medium;
  const reverseUrl =
    coin.images?.reverse?.thumb || coin.images?.reverse?.medium;

  const obverseSrcSet = buildListSrcSet(coin.images?.obverse);
  const reverseSrcSet = buildListSrcSet(coin.images?.reverse);

  const denomination = coin.d_denominations?.denomination_name;

  return (
    <div
      className={`${styles.coinListItem} ${coin.is_owned ? styles.owned : ""}`}
      onClick={() => onClick(coin)}
    >
      {/* 1. DUAL IMAGES (Obverse + Reverse) */}
      <div className={styles.listImagesContainer}>
        <div className={`${styles.listImgWrapper} relative`}>
          {obverseUrl ? (
            <FadeInImage
              src={obverseUrl}
              srcSet={obverseSrcSet}
              sizes="80px"
              alt="Obv"
              fill
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className={styles.listItemPlaceholder}>No Obv</div>
          )}
        </div>
        <div className={`${styles.listImgWrapper} relative`}>
          {reverseUrl ? (
            <FadeInImage
              src={reverseUrl}
              srcSet={reverseSrcSet}
              sizes="80px"
              alt="Rev"
              fill
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className={styles.listItemPlaceholder}>No Rev</div>
          )}
        </div>
      </div>

      {/* 2. CONTENT */}
      <div className={styles.listItemContent}>
        <div className={styles.listItemHeader}>
          <h3 className={styles.listItemTitle}>{coin.name}</h3>
          {denomination && (
            <span className={styles.listItemDenom}>{denomination}</span>
          )}
        </div>

        <div className={styles.listItemMeta}>
          <div className={styles.metaTag}>
            <Calendar size={12} />
            <span>{coin.year || "ND"}</span>
          </div>

          {coin.km && (
            <div className={styles.metaTag}>
              <Hash size={12} />
              <span>{coin.km}</span>
            </div>
          )}

          {/* Uses global mobile-hidden class */}
          <div className={`${styles.metaTag} mobile-hidden`}>
            <span>{coin.d_series?.series_name}</span>
          </div>
        </div>
      </div>

      {/* 3. ACTIONS / STATUS */}
      <div className={styles.listItemActions}>
        {coin.is_owned && (
          <div className={styles.listOwnedStatus}>
            <CheckCircle size={16} />
            <span>Owned</span>
          </div>
        )}
        <div className={styles.listPrice}>
          <DollarSign size={14} />
          <span>{coin.price_usd ? coin.price_usd.toFixed(2) : "---"}</span>
        </div>
      </div>
    </div>
  );
});

export default CoinListItem;
