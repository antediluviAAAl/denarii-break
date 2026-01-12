/* src/components/CoinDetailView/index.jsx */
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Search,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useCoinModal } from "../CoinModal/useCoinModal";
import AddCoinModal from "../AddCoinModal";
import HighResCoinImage from "./HighResCoinImage";
import CoinDetailSkeleton from "./CoinDetailSkeleton";
import styles from "./CoinDetailView.module.css";

export default function CoinDetailView({
  coinId,
  initialData,
  onClose,
  showCloseBtn = true,
}) {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const {
    data: details,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoinModal(coinId);

  // Merge initial data (from card) with full details (from DB)
  const displayData = details
    ? { ...initialData, ...details }
    : initialData || {};

  // CHECK: Are we waiting for the first fetch?
  const isFetchingInitial = !displayData.coin_id && isLoading;

  // CHECK: Do we have stale data from a previous open?
  const isStaleData =
    displayData.coin_id &&
    String(displayData.coin_id) !== String(coinId) &&
    !isLoading;

  // RENDER SKELETON if loading or stale
  if (isFetchingInitial || isStaleData) {
    return <CoinDetailSkeleton onClose={onClose} showCloseBtn={showCloseBtn} />;
  }

  // --- IMAGES ---
  const images = displayData.images || {};
  const getOriginal = (side) => images[side]?.full || images[side]?.original;
  const getMedium = (side) =>
    images[side]?.medium || images[side]?.full || images[side]?.original;

  // --- LINKS ---
  const coinName = displayData.name || "";
  const coinYear = displayData.year ? String(displayData.year) : "";
  const query = coinName.includes(coinYear)
    ? coinName
    : `${coinName} ${coinYear}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}`;

  const renderLink = (text, url) => {
    // If we are refreshing data but have the shell, show mini-skeletons for text
    if (isLoading && !text)
      return <span className={`${styles.skeleton} ${styles.w80}`}></span>;
      
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
    <>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.title}>{displayData.name || "Loading..."}</h2>
          <div className={styles.headerActions}>
            {displayData.is_owned && (
              <div
                className={styles.actionBtn}
                style={{
                  background: "#d1fae5",
                  border: "1px solid #10b981",
                  color: "#065f46",
                  cursor: "default",
                }}
              >
                <CheckCircle size={20} />
              </div>
            )}
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
              style={{
                background: "#eff6ff",
                border: "1px solid var(--primary)",
                color: "var(--primary)",
              }}
            >
              <Search size={20} />
            </a>
            {session && !displayData.is_owned && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={styles.actionBtn}
                style={{
                  background: "#fffbeb",
                  border: "1px solid var(--brand-gold)",
                  color: "#d97706",
                }}
              >
                <PlusCircle size={20} />
              </button>
            )}
          </div>
        </div>
        {showCloseBtn && (
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </div>

      <div className={styles.body}>
        {isError && (
          <div className="p-4 mb-4 text-red-700 bg-red-50 rounded-lg flex items-center gap-3 border border-red-200">
            <AlertTriangle size={20} />
            <span>{error?.message || "Error loading details"}</span>
          </div>
        )}

        {/* IMAGE GRID */}
        <div className={styles.coinImages}>
          <div className={styles.coinImageWrapper}>
            <HighResCoinImage
              key={`${coinId}-obverse`}
              label="Obverse"
              srcMedium={getMedium("obverse")}
              srcOriginal={getOriginal("obverse")}
              alt="Obverse"
            />
          </div>
          <div className={styles.coinImageWrapper}>
            <HighResCoinImage
              key={`${coinId}-reverse`}
              label="Reverse"
              srcMedium={getMedium("reverse")}
              srcOriginal={getOriginal("reverse")}
              alt="Reverse"
            />
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className={`${styles.coinDetailsGrid} ${styles.threeCol}`}>
          {/* Column 1: Identification */}
          <div className={styles.detailGroup}>
            <h3>Identification</h3>
            <div className={styles.detailItem}>
              <strong>Coin ID:</strong>{" "}
              <span className={styles.detailValue}>{displayData.coin_id}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>KM#:</strong>{" "}
              <span className={styles.detailValue}>
                {displayData.km || "N/A"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <strong>Denomination:</strong>
              <span className={styles.detailValue}>
                {isLoading && !displayData.d_denominations ? (
                  <span className={`${styles.skeleton} ${styles.w60}`}></span>
                ) : (
                  displayData.d_denominations?.denomination_name || "Unknown"
                )}
              </span>
            </div>
            <div className={styles.detailItem}>
              <strong>Year:</strong>
              <span className={styles.detailValue}>
                {displayData.year || "?"}
                {displayData.d_series?.series_range && (
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: "0.85em" }}
                  >
                    {" "}
                    ({displayData.d_series.series_range})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Column 2: Groups */}
          <div className={styles.detailGroup}>
            <h3>Groups</h3>
            <div className={styles.detailItem}>
              <strong>Series:</strong>{" "}
              {renderLink(
                displayData.d_series?.series_name,
                displayData.d_series?.series_link
              )}
            </div>
            <div className={styles.detailItem}>
              <strong>Period:</strong>{" "}
              {renderLink(
                displayData.d_period?.period_name,
                displayData.d_period?.period_link
              )}
            </div>

            <div className={styles.detailItem}>
              <strong>Country:</strong>
              <span className={styles.detailValue}>
                {isLoading && !displayData.countryName ? (
                  <span className={`${styles.skeleton} ${styles.w40}`}></span>
                ) : (
                  <>
                    {displayData.countryName || "Unknown"}
                    {displayData.parentCountryName && (
                      <span
                        style={{
                          color: "var(--text-light)",
                          fontSize: "0.85em",
                        }}
                      >
                        {" "}
                        ({displayData.parentCountryName})
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Column 3: Extra */}
          <div className={styles.detailGroup}>
            <h3>Extra</h3>
            <div className={styles.detailItem}>
              <strong>Subject:</strong>{" "}
              <span className={styles.detailValue}>
                {displayData.subject || "N/A"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <strong>Price (USD):</strong>{" "}
              <span className={styles.priceTag}>
                {displayData.price_usd
                  ? `$${displayData.price_usd.toFixed(2)}`
                  : "N/A"}
              </span>
            </div>
            <div className={styles.detailItem}>
              <strong>Marked:</strong>
              <span>
                {displayData.marked ? (
                  <span className={styles.badgeTrue}>
                    <CheckCircle size={14} /> Yes
                  </span>
                ) : (
                  <span className={styles.badgeFalse}>
                    <XCircle size={14} /> No
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && session && (
        <AddCoinModal
          onClose={() => setIsAddModalOpen(false)}
          onCoinAdded={() => {
            refetch();
          }}
          userId={session.user.id}
          initialCoin={displayData}
        />
      )}
    </>
  );
}