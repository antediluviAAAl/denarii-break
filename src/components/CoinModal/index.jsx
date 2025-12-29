"use client";

import React, { useEffect } from "react";
import {
  X,
  ExternalLink,
  Calendar,
  DollarSign,
  Hash,
  Globe,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import FadeInImage from "../FadeInImage";
import { useCoinModal } from "./useCoinModal";
import styles from "./CoinModal.module.css";

export default function CoinModal({ coin, onClose }) {
  const { countryName } = useCoinModal(coin);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!coin) return null;

  // Image Logic
  const obverseUrl =
    coin.images?.obverse?.original || coin.images?.obverse?.medium;
  const reverseUrl =
    coin.images?.reverse?.original || coin.images?.reverse?.medium;

  const obverseSrcSet = coin.images?.obverse?.original
    ? `${coin.images.obverse.medium} 600w, ${coin.images.obverse.original} 1200w`
    : undefined;

  const reverseSrcSet = coin.images?.reverse?.original
    ? `${coin.images.reverse.medium} 600w, ${coin.images.reverse.original} 1200w`
    : undefined;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalContent}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.modalTitle}>{coin.name}</h2>
            <div className={styles.modalSubtitle}>
              {coin.d_series?.series_name}
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>
          {/* IMAGES */}
          <div className={styles.coinImages}>
            <div className={styles.coinImageModal}>
              <span className={styles.imageLabel}>Obverse</span>
              {obverseUrl ? (
                <FadeInImage
                  src={obverseUrl}
                  srcSet={obverseSrcSet}
                  sizes="(max-width: 768px) 100vw, 500px"
                  alt={`${coin.name} Obverse`}
                  className={styles.modalImage}
                  fill={false} // Use standard img behavior for modal containment
                />
              ) : (
                <span style={{ color: "#9ca3af" }}>No Image</span>
              )}
            </div>
            <div className={styles.coinImageModal}>
              <span className={styles.imageLabel}>Reverse</span>
              {reverseUrl ? (
                <FadeInImage
                  src={reverseUrl}
                  srcSet={reverseSrcSet}
                  sizes="(max-width: 768px) 100vw, 500px"
                  alt={`${coin.name} Reverse`}
                  className={styles.modalImage}
                  fill={false}
                />
              ) : (
                <span style={{ color: "#9ca3af" }}>No Image</span>
              )}
            </div>
          </div>

          {/* DETAILS GRID */}
          <div className={styles.coinDetailsGrid}>
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>
                <DollarSign size={14} className="inline-icon" /> Price (USD)
              </span>
              <span className={styles.detailValue}>
                {coin.price_usd ? (
                  <span className={styles.priceTag}>
                    ${coin.price_usd.toFixed(2)}
                  </span>
                ) : (
                  "N/A"
                )}
              </span>
            </div>

            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>
                <Calendar size={14} className="inline-icon" /> Year
              </span>
              <span className={styles.detailValue}>{coin.year || "ND"}</span>
            </div>

            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>
                <Globe size={14} className="inline-icon" /> Country
              </span>
              <span className={styles.detailValue}>
                {countryName || "Loading..."}
              </span>
            </div>

            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>
                <Hash size={14} className="inline-icon" /> KM#
              </span>
              <span className={styles.detailValue}>{coin.km || "---"}</span>
            </div>

            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>
                <Award size={14} className="inline-icon" /> Ownership
              </span>
              <div>
                {coin.is_owned ? (
                  <span className={styles.badgeTrue}>
                    <CheckCircle size={14} /> Owned
                  </span>
                ) : (
                  <span className={styles.badgeFalse}>
                    <XCircle size={14} /> Not Owned
                  </span>
                )}
              </div>
            </div>

            {coin.d_period?.period_link && (
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>
                  <BookOpen size={14} className="inline-icon" /> Reference
                </span>
                <a
                  href={coin.d_period.period_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalLink}
                >
                  Numista Period <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
