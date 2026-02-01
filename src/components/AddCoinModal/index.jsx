/* src/components/AddCoinModal/index.jsx */
"use client";

import React from "react";
import { X, CheckCircle } from "lucide-react";
import { useAddCoin } from "./useAddCoin";
import styles from "./AddCoinModal.module.css";

export default function AddCoinModal({
  onClose,
  onCoinAdded,
  userId,
  initialCoin,
  ownedCoins = [], 
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
    ownedSet, 
  } = useAddCoin(onClose, onCoinAdded, userId, initialCoin);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {step === 1 ? "Add Coin" : "Upload Details"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* STEP 1: SEARCH */}
          {step === 1 && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name, KM#, etc..."
                className={styles.searchBox} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />

              {loading && <p style={{ padding: "0.5rem", color: "var(--text-muted)" }}>Searching...</p>}

              <div className={styles.coinList}>
                {results.map((coin) => {
                  const isOwned = ownedSet.has(coin.coin_id);
                  
                  return (
                    <div
                      key={coin.coin_id}
                      className={`${styles.resultItem} ${isOwned ? styles.owned : ""}`}
                      onClick={() => handleSelectCoin(coin)}
                    >
                      <div className={styles.resultInfo}>
                        <div className={styles.resultHeader}>
                          <span className={styles.coinName}>{coin.name}</span>
                          <span className={styles.periodBadge}>
                            {coin.year}
                          </span>
                        </div>
                        <div className={styles.resultDesc}>
                          {coin.d_denominations?.denomination_name} • {coin.d_period?.period_shorthand} • {coin.km}
                          {coin.subject && ` • ${coin.subject}`}
                        </div>
                      </div>
                      {isOwned && <CheckCircle size={18} style={{ color: "var(--status-green-text)" }} />}
                    </div>
                  );
                })}
                
                {results.length === 0 && searchQuery.length > 1 && !loading && (
                  <p style={{ padding: "0.5rem", color: "var(--text-muted)" }}>No coins found.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRM & UPLOAD */}
          {step === 2 && selectedCoin && (
            <form onSubmit={handleSubmit} className={styles.uploadForm}>
              <div className={styles.selectedCoinCard}>
                <span className={styles.selectedLabel}>Selected Coin</span>
                <div className={styles.resultHeader}>
                  <span className={styles.coinName}>{selectedCoin.name}</span>
                  <span className={styles.periodBadge}>{selectedCoin.year}</span>
                </div>
                {selectedCoin.subject && (
                  <div className={styles.resultDesc} style={{ marginTop: '4px' }}>
                    {selectedCoin.subject}
                  </div>
                )}
                
                <button
                  type="button"
                  className={styles.changeLink}
                  onClick={handleBackToSearch}
                >
                  Change Coin
                </button>
              </div>

              <div className={styles.sectionGroup}>
                <h4 className={styles.sectionTitle}>Your Collection Data</h4>
                
                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Obverse Image</label>
                  {/* FIX: Name is now 'obverse' */}
                  <input
                    type="file"
                    name="obverse"
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Reverse Image</label>
                  {/* FIX: Name is now 'reverse' */}
                  <input
                    type="file"
                    name="reverse"
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add to Collection"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}