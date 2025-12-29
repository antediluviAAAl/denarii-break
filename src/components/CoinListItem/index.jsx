"use client";
import React, { memo } from "react";
import Link from "next/link";
import { Calendar, DollarSign, Hash, CheckCircle } from "lucide-react";
import FadeInImage from "../FadeInImage";
import styles from "./CoinListItem.module.css";

const buildListSrcSet = (imgObj) => {
  if (!imgObj) return undefined;
  const variants = [];
  if (imgObj.thumb) variants.push(`${imgObj.thumb} 150w`);
  if (imgObj.medium) variants.push(`${imgObj.medium} 600w`);
  return variants.join(", ") || undefined;
};

const CoinListItem = memo(function CoinListItem({ coin }) {
  const obverseUrl =
    coin.images?.obverse?.thumb || coin.images?.obverse?.medium;
  const reverseUrl =
    coin.images?.reverse?.thumb || coin.images?.reverse?.medium;
  const obverseSrcSet = buildListSrcSet(coin.images?.obverse);
  const reverseSrcSet = buildListSrcSet(coin.images?.reverse);

  return (
    <Link
      href={`/coin/${coin.coin_id}`}
      className={`${styles.coinListItem} ${coin.is_owned ? styles.owned : ""}`}
      style={{
        display: "flex",
        textDecoration: "none",
        color: "inherit",
        width: "100%",
      }}
    >
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

      <div className={styles.listItemContent}>
        <div className={styles.listItemHeader}>
          <h3 className={styles.listItemTitle}>{coin.name}</h3>
          {coin.d_denominations?.denomination_name && (
            <span className={styles.listItemDenom}>
              {coin.d_denominations.denomination_name}
            </span>
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
          {/* UPDATED: Removed 'mobile-hidden' to ensure visibility */}
          {coin.d_series?.series_name && (
            <div className={styles.metaTag}>
              <span>{coin.d_series.series_name}</span>
            </div>
          )}
        </div>
      </div>

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
    </Link>
  );
});

export default CoinListItem;
