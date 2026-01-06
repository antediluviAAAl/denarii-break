/* src/components/Hub/RegionView.jsx */
"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import SelectionModal from "./SelectionModal";
import styles from "./Hub.module.css";

export default function RegionView({ data, onClose }) {
  const router = useRouter();

  // STATE: Sort Order (true = A-Z, false = Z-A)
  const [isAscending, setIsAscending] = useState(true);

  // LOGIC: Sort the groups alphabetically based on toggle
  const sortedCountries = useMemo(() => {
    if (!data.hierarchicalCountries) return [];

    // Create a shallow copy to sort
    const sorted = [...data.hierarchicalCountries];

    // Sort Groups
    sorted.sort((a, b) => {
      return isAscending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

    return sorted;
  }, [data.hierarchicalCountries, isAscending]);

  const handleDeepSelect = (ultId, countryId) => {
    const params = new URLSearchParams();
    if (ultId) params.set("ultimateEntity", ultId);
    if (countryId) params.set("country", countryId);
    params.set("sortBy", "year_desc");
    router.push(`/gallery?${params.toString()}`);
  };

  const formatCount = (count) => {
    if (!count) return "";
    return `(${count.toLocaleString()})`;
  };

  // HEADER ACTION: The Sort Toggle Button
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
      title={isAscending ? "Switch to Z-A" : "Switch to A-Z"}
    >
      <ArrowUpDown size={14} />
      {isAscending ? "A-Z" : "Z-A"}
    </button>
  );

  return (
    <SelectionModal
      title="Select Region"
      onClose={onClose}
      headerActions={headerAction}
    >
      <div>
        {sortedCountries.map((group) => {
          const isComposite = group.isComposite;

          if (isComposite) {
            // SCENARIO A: Composite (German States)
            // Header is Label. Grid is Clickable Children.
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
            // SCENARIO B: Singleton (Romania)
            // Header is Clickable. Grid is HIDDEN (The Fix).
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
                {/* No ItemGrid rendered here */}
              </div>
            );
          }
        })}
      </div>
    </SelectionModal>
  );
}
