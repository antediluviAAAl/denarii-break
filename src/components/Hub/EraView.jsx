/* src/components/Hub/EraView.jsx */
"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import SelectionModal from "./SelectionModal";
import styles from "./Hub.module.css";
import { groupPeriodsByYear } from "../../utils/dataUtils";

export default function EraView({ data, onClose }) {
  const router = useRouter();

  // STATE: Sort Order (false = Newest First/Desc, true = Oldest First/Asc)
  const [isAscending, setIsAscending] = useState(false);

  // LOGIC: Group and Sort Periods
  const groupedPeriods = useMemo(() => {
    if (data.hierarchicalPeriods) {
      // 1. Group by Year
      const groups = groupPeriodsByYear(data.hierarchicalPeriods);

      // 2. Handle Sort Toggle
      if (isAscending) {
        return [...groups].reverse();
      }
      return groups;
    }
    return [];
  }, [data.hierarchicalPeriods, isAscending]);

  const handlePeriodDeepSelect = (periodId, countryId, ultimateEntityId) => {
    const params = new URLSearchParams();
    params.set("period", periodId);
    if (countryId) params.set("country", countryId);
    if (ultimateEntityId) params.set("ultimateEntity", ultimateEntityId);

    // Match Gallery Sort to Timeline Sort
    params.set("sortBy", isAscending ? "year_asc" : "year_desc");
    router.push(`/gallery?${params.toString()}`);
  };

  // HEADER ACTION: Sort Toggle
  const headerAction = (
    <button
      className={styles.selectionItem}
      style={{
        padding: "0.4rem 0.8rem",
        fontSize: "0.8rem",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        minWidth: "auto",
        border: "1px solid #e5e7eb",
      }}
      onClick={() => setIsAscending(!isAscending)}
      title={isAscending ? "Switch to Newest First" : "Switch to Oldest First"}
    >
      <ArrowUpDown size={14} />
      {isAscending ? "Oldest First" : "Newest First"}
    </button>
  );

  return (
    <SelectionModal
      title="Select Era"
      onClose={onClose}
      headerActions={headerAction}
    >
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
                const displayRange = period.range ? `(${period.range})` : "";

                return (
                  <div key={period.id}>
                    {/* Static Header */}
                    <h3
                      className={styles.groupHeader}
                      style={{
                        cursor: "default",
                        marginTop: "0.5rem",
                        pointerEvents: "none",
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

                    {/* Clickable Badges */}
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
            style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}
          >
            Loading eras...
          </div>
        )}
      </div>
    </SelectionModal>
  );
}
