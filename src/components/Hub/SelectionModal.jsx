/* src/components/Hub/SelectionModal.jsx */
"use client";
import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Hub.module.css";

export default function SelectionModal({ type, data, onClose }) {
  const router = useRouter();

  const handleSelect = (paramKey, paramValue) => {
    // Navigate to Gallery with filter
    router.push(`/gallery?${paramKey}=${paramValue}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {type === "countries" ? "Select Region" : "Select Period"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {type === "countries" && (
            <div>
              {data.hierarchicalCountries.map((group) => (
                <div key={group.id}>
                  {/* Clicking the Header selects the Ultimate Entity */}
                  <h3
                    className={styles.groupHeader}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelect("ultimateEntity", group.id)}
                    title={`View all coins from ${group.name}`}
                  >
                    {group.name}
                  </h3>
                  <div className={styles.itemGrid}>
                    {group.children.map((child) => (
                      <button
                        key={child.country_id}
                        className={styles.selectionItem}
                        onClick={() =>
                          handleSelect("country", child.country_id)
                        }
                      >
                        {child.country_name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === "periods" && (
            <div className={styles.itemGrid}>
              {/* Note: In your current logic, periods are often tied to countries.
                  If data.periods is empty (because no country selected), we show a fallback or just categories.
                  For now, assuming we might populate global periods later, or use Categories as fallback. */}
              <div
                style={{
                  color: "#9ca3af",
                  width: "100%",
                  paddingBottom: "1rem",
                }}
              >
                Tip: Select a country first to see specific historical periods,
                or browse all coins by year.
              </div>

              <button
                className={`${styles.selectionItem} ${styles.timelineItem}`}
                onClick={() => router.push("/gallery?sortBy=year_asc")}
                style={{
                  justifyContent: "center",
                  width: "100%",
                  padding: "1rem",
                  background: "var(--brand-gold)",
                  color: "#000",
                }}
              >
                BROWSE ALL COINS CHRONOLOGICALLY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
