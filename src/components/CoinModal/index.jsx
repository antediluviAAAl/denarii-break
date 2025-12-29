"use client";

import React, { useEffect } from "react";
import {
  X,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Search,
  AlertTriangle,
  XCircle
} from "lucide-react";
import FadeInImage from "../FadeInImage";
import { useCoinModal } from "./useCoinModal";
import styles from "./CoinModal.module.css";

export default function CoinModal({ coin, onClose, session, onAddCoin }) {
  // Use Smart Hook for deep data
  const { data: details, isLoading, isError, error } = useCoinModal(coin.coin_id);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!coin) return null;

  // Merge Prop Data with Fetched Data
  const displayData = details ? { ...coin, ...details } : coin;
  
  // Preserve local ownership/image data
  if (!displayData.is_owned) displayData.is_owned = coin.is_owned;
  if (!displayData.images) displayData.images = coin.images;

  // --- IMAGES ---
  const obverseUrl =
    displayData.images?.obverse?.full ||
    displayData.images?.obverse?.original ||
    displayData.images?.obverse?.medium;
  const reverseUrl =
    displayData.images?.reverse?.full ||
    displayData.images?.reverse?.original ||
    displayData.images?.reverse?.medium;

  // --- SMART SEARCH LOGIC ---
  const coinName = displayData.name || "";
  const coinYear = displayData.year ? String(displayData.year) : "";
  const query = coinName.includes(coinYear) ? coinName : `${coinName} ${coinYear}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  // --- HELPER: RENDER LINK ---
  const renderLink = (text, url) => {
    if (!url) return <span>{text || "Unknown"}</span>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.modalLink}
        onClick={(e) => e.stopPropagation()}
      >
        {text} <ExternalLink size={12} style={{ marginBottom: 2 }} />
      </a>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.modalTitle}>{displayData.name}</h2>
            
            <div className={styles.headerActions}>
              {/* Owned Badge */}
              {displayData.is_owned && (
                <div
                  className={styles.actionBtn}
                  style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", cursor: "default" }}
                  title="You own this coin"
                >
                  <CheckCircle size={20} />
                </div>
              )}

              {/* Google Search Button */}
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtn}
                style={{ background: "#eff6ff", border: "1px solid var(--primary)", color: "var(--primary)" }}
                title="Search on Google"
              >
                <Search size={20} />
              </a>

              {/* Add Coin Button */}
              {session && !displayData.is_owned && onAddCoin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCoin(displayData);
                  }}
                  className={styles.actionBtn}
                  style={{ background: "#fffbeb", border: "1px solid var(--brand-gold)", color: "#d97706" }}
                  title="Add to Collection"
                >
                  <PlusCircle size={20} />
                </button>
              )}
            </div>
          </div>
          
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>
          {isError && (
             <div className="p-4 mb-4 text-red-700 bg-red-50 rounded-lg flex items-center gap-3 border border-red-200">
               <AlertTriangle size={20} />
               <span>{error?.message || "Error loading details"}</span>
             </div>
          )}

          {isLoading && !details ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
              Loading full details...
            </div>
          ) : (
            <>
              {/* IMAGES */}
              <div className={styles.coinImages}>
                <div className={styles.coinImageModal}>
                  <h3>Obverse</h3>
                  {obverseUrl ? (
                    <FadeInImage src={obverseUrl} alt="Obverse" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#9ca3af" }}>No Image</span>
                  )}
                </div>
                <div className={styles.coinImageModal}>
                  <h3>Reverse</h3>
                  {reverseUrl ? (
                    <FadeInImage src={reverseUrl} alt="Reverse" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#9ca3af" }}>No Image</span>
                  )}
                </div>
              </div>

              {/* 3-COLUMN DATA GRID */}
              <div className={`${styles.coinDetailsGrid} ${styles.threeCol}`}>
                
                {/* COLUMN 1: IDENTIFICATION */}
                <div className={styles.detailGroup}>
                  <h3>Identification</h3>
                  <div className={styles.detailItem}>
                    <strong>Coin ID:</strong> <span className={styles.detailValue}>{displayData.coin_id}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>KM#:</strong> <span className={styles.detailValue}>{displayData.km || "N/A"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Denomination:</strong> 
                    <span className={styles.detailValue}>
                      {displayData.d_denominations?.denomination_name || "Unknown"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Year:</strong>
                    <span className={styles.detailValue}>
                      {displayData.year || "?"} 
                      {displayData.d_series?.series_range && (
                        <span style={{color: "var(--text-light)", fontSize: "0.85em"}}> ({displayData.d_series.series_range})</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* COLUMN 2: GROUPS */}
                <div className={styles.detailGroup}>
                  <h3>Groups</h3>
                  <div className={styles.detailItem}>
                    <strong>Series:</strong>
                    {renderLink(displayData.d_series?.series_name, displayData.d_series?.series_link)}
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Period:</strong>
                    {renderLink(displayData.d_period?.period_name, displayData.d_period?.period_link)}
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Country:</strong>
                    <span className={styles.detailValue}>{displayData.countryName || "Unknown"}</span>
                  </div>
                </div>

                {/* COLUMN 3: EXTRA */}
                <div className={styles.detailGroup}>
                  <h3>Extra</h3>
                  <div className={styles.detailItem}>
                    <strong>Subject:</strong> <span className={styles.detailValue}>{displayData.subject || "N/A"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Price (USD):</strong>
                    <span className={styles.priceTag}>
                       {displayData.price_usd ? `$${displayData.price_usd.toFixed(2)}` : "N/A"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Marked:</strong>
                    <span>
                      {displayData.marked ? <span className={styles.badgeTrue}><CheckCircle size={12}/> Yes</span> : <span className={styles.badgeFalse}><XCircle size={12}/> No</span>}
                    </span>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}