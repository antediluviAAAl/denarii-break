/* src/components/CoinDetailView/CoinDetailSkeleton.jsx */
"use client";
import React from "react";
import { X } from "lucide-react";
import styles from "./CoinDetailView.module.css";

export default function CoinDetailSkeleton({ onClose, showCloseBtn = true }) {
  return (
    <>
      {/* HEADER SKELETON */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          {/* Pulsing Title Bar */}
          <div 
            className={styles.skeleton} 
            style={{ width: "250px", height: "2rem", borderRadius: "6px" }} 
          />
        </div>
        {showCloseBtn && (
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </div>

      <div className={styles.body}>
        {/* IMAGE PLACEHOLDERS */}
        <div className={styles.coinImages}>
          <div className={`${styles.coinImageWrapper} ${styles.skeleton}`} style={{ opacity: 0.5 }}></div>
          <div className={`${styles.coinImageWrapper} ${styles.skeleton}`} style={{ opacity: 0.5 }}></div>
        </div>

        {/* DETAILS GRID SKELETON */}
        <div className={`${styles.coinDetailsGrid} ${styles.threeCol}`}>
          
          {/* Col 1 */}
          <div className={styles.detailGroup}>
            <div className={`${styles.skeleton} ${styles.w60}`} style={{ height: "1.2rem", marginBottom: "1rem" }} />
            <div className={styles.detailItem} style={{ gap: "6px" }}>
               <div className={`${styles.skeleton} ${styles.w40}`} />
               <div className={`${styles.skeleton} ${styles.w80}`} />
            </div>
            <div className={styles.detailItem} style={{ gap: "6px", marginTop: "0.5rem" }}>
               <div className={`${styles.skeleton} ${styles.w40}`} />
               <div className={`${styles.skeleton} ${styles.w60}`} />
            </div>
          </div>

          {/* Col 2 */}
          <div className={styles.detailGroup}>
             <div className={`${styles.skeleton} ${styles.w60}`} style={{ height: "1.2rem", marginBottom: "1rem" }} />
             <div className={styles.detailItem} style={{ gap: "6px" }}>
               <div className={`${styles.skeleton} ${styles.w40}`} />
               <div className={`${styles.skeleton} ${styles.w100}`} />
            </div>
             <div className={styles.detailItem} style={{ gap: "6px", marginTop: "0.5rem" }}>
               <div className={`${styles.skeleton} ${styles.w40}`} />
               <div className={`${styles.skeleton} ${styles.w80}`} />
            </div>
          </div>

          {/* Col 3 */}
          <div className={styles.detailGroup}>
             <div className={`${styles.skeleton} ${styles.w60}`} style={{ height: "1.2rem", marginBottom: "1rem" }} />
             <div className={styles.detailItem} style={{ gap: "6px" }}>
               <div className={`${styles.skeleton} ${styles.w40}`} />
               <div className={`${styles.skeleton} ${styles.w60}`} />
            </div>
             <div className={styles.detailItem} style={{ gap: "6px", marginTop: "0.5rem" }}>
               <div className={`${styles.skeleton} ${styles.w40}`} />
               <div className={`${styles.skeleton} ${styles.w40}`} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}