/* src/components/Hub/SelectionModal.jsx */
"use client";
import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Hub.module.css";

export default function SelectionModal({ type, data, onClose }) {
  const router = useRouter();

  const handleDeepSelect = (ultId, countryId) => {
    const params = new URLSearchParams();
    if (ultId) params.set("ultimateEntity", ultId);
    if (countryId) params.set("country", countryId);
    params.set("sortBy", "year_desc");
    router.push(`/gallery?${params.toString()}`);
  };

  const handlePeriodDeepSelect = (periodId, countryId, ultimateEntityId) => {
    const params = new URLSearchParams();
    params.set("period", periodId);
    if (countryId) params.set("country", countryId);
    if (ultimateEntityId) params.set("ultimateEntity", ultimateEntityId);

    // Sort oldest first when viewing a period to see evolution
    params.set("sortBy", "year_asc");
    router.push(`/gallery?${params.toString()}`);
  };

  const formatCount = (count) => {
    if (!count) return "";
    return `(${count.toLocaleString()})`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {type === "countries" ? "Select Region" : "Select Era"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* --- COUNTRY LOGIC --- */}
          {type === "countries" && (
            <div>
              {data.hierarchicalCountries.map((group) => {
                const isComposite = group.isComposite;

                if (isComposite) {
                  return (
                    <div key={group.id}>
                      <h3
                        className={styles.groupHeader}
                        style={{ cursor: "default" }}
                      >
                        {group.name}
                        <span
                          style={{
                            fontSize: "0.8em",
                            color: "#9ca3af",
                            fontWeight: "400",
                            marginLeft: "6px",
                          }}
                        >
                          {formatCount(group.totalCount)}
                        </span>
                      </h3>
                      <div className={styles.itemGrid}>
                        {group.children.map((child) => (
                          <button
                            key={child.country_id}
                            className={styles.selectionItem}
                            onClick={() =>
                              handleDeepSelect(group.id, child.country_id)
                            }
                          >
                            {child.country_name}
                            <span
                              style={{
                                fontSize: "0.85em",
                                color: "#6b7280",
                                marginLeft: "4px",
                              }}
                            >
                              {formatCount(child.count)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  const childId = group.children[0]?.country_id;
                  if (!childId) return null;

                  return (
                    <div key={group.id}>
                      <h3
                        className={styles.groupHeader}
                        style={{ cursor: "pointer" }}
                        title={`View collection from ${group.name}`}
                        onClick={() => handleDeepSelect(group.id, childId)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--brand-gold)")
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                      >
                        {group.name}
                        <span
                          style={{
                            fontSize: "0.8em",
                            color: "#9ca3af",
                            fontWeight: "400",
                            marginLeft: "6px",
                          }}
                        >
                          {formatCount(group.totalCount)}
                        </span>
                      </h3>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {/* --- PERIOD LOGIC (UPDATED) --- */}
          {type === "periods" && (
            <div>
              {data.hierarchicalPeriods &&
                data.hierarchicalPeriods.map((period) => {
                  const displayName = period.shorthand || period.name;
                  const displayRange = period.range ? `(${period.range})` : "";

                  return (
                    <div key={period.id}>
                      {/* 1. HEADER (Matches Country Style Exactly) */}
                      <h3
                        className={styles.groupHeader}
                        // We make the header clickable to view the "Global Era" context
                        style={{ cursor: "pointer" }}
                        onClick={() => handlePeriodDeepSelect(period.id)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--brand-gold)")
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                      >
                        {displayName}
                        {/* 2. RANGE (Matches Country Count Style Exactly) */}
                        <span
                          style={{
                            fontSize: "0.8em",
                            color: "#9ca3af",
                            fontWeight: "400",
                            marginLeft: "6px",
                          }}
                        >
                          {displayRange}
                        </span>
                      </h3>

                      {/* 3. GRID (Matches Country Badge Grid Exactly) */}
                      <div className={styles.itemGrid}>
                        {period.children.map((child) => (
                          <button
                            key={child.country_id}
                            className={styles.selectionItem}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent header click
                              handlePeriodDeepSelect(
                                period.id,
                                child.country_id,
                                child.ultimate_entity_id
                              );
                            }}
                            title={`View ${period.name} coins from ${child.country_name}`}
                          >
                            {child.country_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {(!data.hierarchicalPeriods ||
                data.hierarchicalPeriods.length === 0) && (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Loading eras...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
