/* src/components/Hub/SelectionModal.jsx */
"use client";
import React from "react";
import { X } from "lucide-react";
import styles from "./Hub.module.css";

// This is now a "Dumb Shell" component.
// It accepts title, actions (buttons), and children (content) from the specific Views.
export default function SelectionModal({
  title,
  headerActions,
  onClose,
  children,
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* SHARED HEADER STRUCTURE */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Inject Sort Buttons or other actions here */}
            {headerActions}

            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* DYNAMIC CONTENT BODY */}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
