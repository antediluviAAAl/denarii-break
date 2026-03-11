"use client";

import React from 'react';
import { X, Activity } from 'lucide-react';
import styles from './GatheringDataModal.module.css';

export default function GatheringDataModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.iconWrapper}>
          <div className={styles.spinner}></div>
        </div>

        <h2 className={styles.title}>Gathering Market Data</h2>
        
        <p className={styles.description}>
          We are gathering coin listings to determine the market price. 
          This process involves scanning multiple global marketplaces and might take about a minute.
        </p>

        <p className={styles.hint}>
          You can close this window and continue using the app. 
          The analysis will complete in the background.
        </p>
      </div>
    </div>
  );
}
