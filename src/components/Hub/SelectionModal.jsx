/* src/components/Hub/SelectionModal.jsx */
"use client";
import React, { useMemo, useState } from "react";
import { X, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Hub.module.css";
import { groupPeriodsByYear } from "../../utils/dataUtils";

export default function SelectionModal({ type, data, onClose }) {
  const router = useRouter();

  // STATE: Sort Order (false = Newest First/Desc, true = Oldest First/Asc)
  const [isAscending, setIsAscending] = useState(false);

  // Group Periods if we are in 'periods' mode
  const groupedPeriods = useMemo(() => {
    if (type === "periods" && data.hierarchicalPeriods) {
      // 1. Group by Year (The raw data is already sorted Newest->Oldest from the API)
      const groups = groupPeriodsByYear(data.hierarchicalPeriods);

      // 2. Handle Sort Toggle
      if (isAscending) {
        return [...groups].reverse(); // Flip to Oldest->Newest
      }
      return groups; // Keep as Newest->Oldest
    }
    return [];
  }, [type, data.hierarchicalPeriods, isAscending]);

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

    // If viewing Oldest First timeline, keep that sort order in gallery
    params.set("sortBy", isAscending ? "year_asc" : "year_desc");
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

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* NEW: Sort Toggle (Only visible for Periods) */}
            {type === "periods" && (
              <button
                className={styles.selectionItem}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onClick={() => setIsAscending(!isAscending)}
              >
                <ArrowUpDown size={14} />
                {isAscending ? "Oldest First" : "Newest First"}
              </button>
            )}

            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* --- COUNTRY LOGIC --- */}
          {type === "countries" && (
            <div>
              {data.hierarchicalCountries.map((group) => (
                <div key={group.id}>
                  <h3
                    className={styles.groupHeader}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleDeepSelect(group.id, group.children[0]?.country_id)
                    }
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
                  <div className={styles.itemGrid}>
                    {group.children.map((child) => (
                      <button
                        key={child.country_id}
                        className={styles.selectionItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeepSelect(group.id, child.country_id);
                        }}
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
              ))}
            </div>
          )}

          {/* --- PERIOD LOGIC (TIMELINE VIEW) --- */}
          {type === "periods" && (
            <div className={styles.timelineContainer}>
              {groupedPeriods.map((group) => (
                <div key={group.year} className={styles.timelineGroup}>
                  {/* 1. The Dot */}
                  <div className={styles.timelineNode} />

                  {/* 2. The Year Label */}
                  <div className={styles.timelineYear}>{group.year}</div>

                  {/* 3. The Periods in this Year */}
                  <div>
                    {group.periods.map((period) => {
                      const displayName = period.shorthand || period.name;
                      const displayRange = period.range
                        ? `(${period.range})`
                        : "";

                      return (
                        <div key={period.id}>
                          {/* HEADER IS NOW STATIC (Non-clickable) */}
                          <h3
                            className={styles.groupHeader}
                            style={{
                              cursor: "default",
                              marginTop: "0.5rem",
                              // Removed hover effects since it's not clickable
                            }}
                          >
                            {displayName}
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

                          {/* BADGES (Clickable) */}
                          <div className={styles.itemGrid}>
                            {period.children.map((child) => (
                              <button
                                key={child.country_id}
                                className={styles.selectionItem}
                                onClick={(e) => {
                                  e.stopPropagation();
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
                  </div>
                </div>
              ))}

              {(!groupedPeriods || groupedPeriods.length === 0) && (
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
