"use client";
import React, { useEffect } from "react";
import CoinDetailView from "../CoinDetailView"; // Correct relative path
import styles from "./CoinModal.module.css";

// Note: CoinModal now acts as the Interceptor Shell
export default function CoinModal({ coinId, initialData, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <CoinDetailView
          coinId={coinId}
          initialData={initialData}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
