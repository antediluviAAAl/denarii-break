/* src/components/AddCoinModal/index.jsx */
"use client";

import React from "react";
import { X, CheckCircle, Upload, Loader2, FolderInput } from "lucide-react";
import { useAddCoin } from "./useAddCoin";
import styles from "./AddCoinModal.module.css";

export default function AddCoinModal({
  onClose,
  onCoinAdded,
  userId,
  initialCoin,
  ownedIds,
}) {
  const {
    step,
    searchQuery,
    setSearchQuery,
    results,
    loading,
    selectedCoin,
    handleSelectCoin,
    handleBackToSearch,
    handleSubmit,
    isSubmitting,
  } = useAddCoin(onClose, onCoinAdded, userId, initialCoin);

  // Helper: Reconstructs the description line exactly like the original
  const getCoinDescription = (coin) => {
    const parts = [];
    if (coin.d_denominations?.denomination_name)
      parts.push(coin.d_denominations.denomination_name);
    if (coin.year) parts.push(coin.year);
    if (coin.km) parts.push(coin.km);
    if (coin.subject) parts.push(coin.subject);
    return parts.join(" • ");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {step === 1 ? "Add to Collection" : "Upload Details"}
          </h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>
          {step === 1 ? (
            /* --- STEP 1: SEARCH --- */
            <div>
              <div className={styles.searchContainer}>
                <input
                  className={styles.searchBox}
                  placeholder="Search catalog by name or KM#..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {loading && (
                  <Loader2
                    className="animate-spin"
                    size={18}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "14px",
                      color: "#9ca3af",
                    }}
                  />
                )}
              </div>

              <div className={styles.coinList}>
                {results.map((coin) => {
                  // Check ownership locally using the passed Set
                  const isOwned = ownedIds && ownedIds.has(coin.coin_id);

                  return (
                    <div
                      key={coin.coin_id}
                      className={`${styles.resultItem} ${
                        isOwned ? styles.owned : ""
                      }`}
                      onClick={() => handleSelectCoin(coin)}
                    >
                      <div className={styles.resultInfo}>
                        <div className={styles.resultHeader}>
                          <span className={styles.coinName}>{coin.name}</span>
                          {coin.d_period?.period_shorthand && (
                            <span className={styles.periodBadge}>
                              {coin.d_period.period_shorthand}
                            </span>
                          )}
                        </div>
                        <div className={styles.resultDesc}>
                          {getCoinDescription(coin)}
                        </div>
                      </div>

                      <CheckCircle
                        size={18}
                        color={isOwned ? "var(--owned-green)" : "var(--border)"}
                        fill={isOwned ? "#dcfce7" : "none"}
                      />
                    </div>
                  );
                })}

                {searchQuery.length > 1 && results.length === 0 && !loading && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "1rem",
                    }}
                  >
                    No coins found.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* --- STEP 2: UPLOAD & PATHS --- */
            <form onSubmit={handleSubmit} className={styles.uploadForm}>
              {/* Selected Coin Card */}
              <div className={styles.selectedCoinCard}>
                <span className={styles.selectedLabel}>SELECTED COIN</span>

                <div
                  className={styles.resultHeader}
                  style={{ marginBottom: "0.25rem" }}
                >
                  <span
                    className={styles.coinName}
                    style={{ fontSize: "1rem" }}
                  >
                    {selectedCoin.name}
                  </span>
                  {selectedCoin.d_period?.period_shorthand && (
                    <span className={styles.periodBadge}>
                      {selectedCoin.d_period.period_shorthand}
                    </span>
                  )}
                </div>

                <div
                  className={styles.resultDesc}
                  style={{ marginBottom: "0.5rem" }}
                >
                  {getCoinDescription(selectedCoin)}
                </div>

                <button
                  type="button"
                  className={styles.changeLink}
                  onClick={handleBackToSearch}
                >
                  Change Coin
                </button>
              </div>

              {/* OBVERSE SECTION */}
              <div className={styles.sectionGroup}>
                <h4 className={styles.sectionTitle}>Obverse (Front)</h4>
                
                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Image File</label>
                  <input
                    type="file"
                    name="obverse"
                    accept="image/*"
                    required
                    className={styles.fileInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Original File Path</label>
                  <div className="relative" style={{ position: 'relative' }}>
                    <FolderInput size={16} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="path_obverse"
                      placeholder="e.g. C:\MyCoins\Europe\1943_obv.jpg"
                      required
                      className={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              {/* REVERSE SECTION */}
              <div className={styles.sectionGroup}>
                <h4 className={styles.sectionTitle}>Reverse (Back)</h4>
                
                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Image File</label>
                  <input
                    type="file"
                    name="reverse"
                    accept="image/*"
                    required
                    className={styles.fileInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Original File Path</label>
                  <div className="relative" style={{ position: 'relative' }}>
                    <FolderInput size={16} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="path_reverse"
                      placeholder="e.g. C:\MyCoins\Europe\1943_rev.jpg"
                      required
                      className={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {isSubmitting ? "Uploading..." : "Upload & Save"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}