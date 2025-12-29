"use client";

import React from "react";
import { X, Search, Upload, Check, Loader2 } from "lucide-react";
import { useAddCoin } from "./useAddCoin";
import styles from "./AddCoinModal.module.css";

export default function AddCoinModal({ onClose, onCoinAdded, userId }) {
  const {
    step,
    searchQuery,
    setSearchQuery,
    results,
    loading,
    selectedCoin,
    handleSelectCoin,
    setObverseFile,
    setReverseFile,
    handleSubmit,
    uploading,
  } = useAddCoin(onClose, onCoinAdded, userId);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {step === 1 ? "Find a Coin" : "Add to Collection"}
          </h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {step === 1 && (
            <>
              <div className="relative">
                <input
                  type="text"
                  className={styles.searchBox}
                  placeholder="Search by name (e.g., 'Denarius')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {loading && (
                  <Loader2
                    className="animate-spin absolute right-3 top-3 text-gray-400"
                    size={20}
                  />
                )}
              </div>

              <div className={styles.searchResults}>
                {results.map((coin) => (
                  <div
                    key={coin.coin_id}
                    className={styles.searchResultItem}
                    onClick={() => handleSelectCoin(coin)}
                  >
                    <div className={styles.resultInfo}>
                      <span className={styles.resultTitle}>{coin.name}</span>
                      <span className={styles.resultMeta}>
                        {coin.year} • KM#{coin.km}
                      </span>
                    </div>
                    <Check size={16} className="text-gray-300" />
                  </div>
                ))}
                {!loading && searchQuery.length > 2 && results.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No coins found.
                  </p>
                )}
              </div>
            </>
          )}

          {step === 2 && selectedCoin && (
            <div className={styles.uploadStep}>
              <div className={styles.selectedCoinPreview}>
                <Check className="text-green-600" />
                <div>
                  <div className="font-bold">{selectedCoin.name}</div>
                  <div className="text-sm text-gray-600">
                    ID: {selectedCoin.coin_id}
                  </div>
                </div>
              </div>

              <div className={styles.uploadField}>
                <label className={styles.uploadLabel}>
                  Obverse Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setObverseFile(e.target.files[0])}
                  className={styles.fileInput}
                />
              </div>

              <div className={styles.uploadField}>
                <label className={styles.uploadLabel}>
                  Reverse Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReverseFile(e.target.files[0])}
                  className={styles.fileInput}
                />
              </div>

              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Save Coin
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
