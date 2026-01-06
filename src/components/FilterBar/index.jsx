/* src/components/FilterBar/index.jsx */
"use client";

import { useEffect } from "react";
import {
  Search,
  X,
  CheckCircle,
  Globe,
  MapPin, // New Icon for Sub-Country
  Calendar,
  SortAsc,
  Tag,
  LayoutGrid,
  Table as TableIcon,
  List as ListIcon,
} from "lucide-react";
import styles from "./FilterBar.module.css";

export default function FilterBar({
  filters,
  setFilters,
  metadata,
  viewMode,
  setViewMode,
  isExploreMode,
}) {
  // --- Handlers ---
  const updateFilter = (key, value) => {
    setFilters((prev) => {
      // Logic for Period: Reset if country changes (handled inside specific handlers below mostly)
      if (key === "country") return { ...prev, [key]: value, period: "" };
      return { ...prev, [key]: value };
    });
  };

  // --- SPECIAL HANDLER: Level 1 (Ultimate Entity) Selection ---
  const handleUltimateChange = (e) => {
    const selectedUltId = e.target.value;

    if (!selectedUltId) {
      // Reset everything
      setFilters((prev) => ({
        ...prev,
        ultimateEntity: "",
        country: "",
        period: "",
      }));
      return;
    }

    // Find the group in metadata
    const group = metadata.hierarchicalCountries.find(
      (g) => String(g.id) === selectedUltId
    );
    if (!group) return;

    if (group.isComposite) {
      // Scenario: German States.
      // Set Ultimate, CLEAR Country (forces lock), CLEAR Period.
      setFilters((prev) => ({
        ...prev,
        ultimateEntity: selectedUltId,
        country: "",
        period: "",
      }));
    } else {
      // Scenario: Romania (Singleton).
      // Set Ultimate, AUTO-SELECT the one child as Country, CLEAR Period.
      const childId = group.children[0]?.country_id || "";
      setFilters((prev) => ({
        ...prev,
        ultimateEntity: selectedUltId,
        country: childId,
        period: "",
      }));
    }
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      ultimateEntity: "",
      country: "",
      period: "",
      showOwned: "all",
    }));
  };

  // SAFETY: If switching to Table View, forbid Price sort
  useEffect(() => {
    if (viewMode === "table" && filters.sortBy.startsWith("price")) {
      updateFilter("sortBy", "year_desc");
    }
  }, [viewMode, filters.sortBy]);

  // --- Tag Logic ---
  const getActiveTags = () => {
    const tags = [];
    if (filters.search) {
      tags.push({
        key: "search",
        label: `Search: "${filters.search}"`,
        action: () => updateFilter("search", ""),
      });
    }
    if (filters.showOwned === "owned") {
      tags.push({
        key: "showOwned",
        label: "Owned Only",
        action: () => updateFilter("showOwned", "all"),
      });
    }

    // Country Tag Logic
    if (filters.ultimateEntity) {
      const group = metadata.hierarchicalCountries.find(
        (g) => String(g.id) === String(filters.ultimateEntity)
      );
      let label = group ? group.name : "Unknown Region";

      // If we have a specific country selected that is DIFFERENT from the group name (Composite), append it
      if (filters.country) {
        const country = metadata.countries.find(
          (c) => String(c.country_id) === String(filters.country)
        );
        if (country && group?.isComposite) {
          label = `${group.name}: ${country.country_name}`;
        }
      }

      tags.push({
        key: "country",
        label: label,
        action: () =>
          setFilters((prev) => ({
            ...prev,
            ultimateEntity: "",
            country: "",
            period: "",
          })),
      });
    }

    if (filters.period) {
      const periodName =
        metadata.periods.find((p) => p.period_id == filters.period)
          ?.period_name || "Unknown Period";
      tags.push({
        key: "period",
        label: periodName,
        action: () => updateFilter("period", ""),
      });
    }
    return tags;
  };

  const activeTags = getActiveTags();
  const hasFilters = activeTags.length > 0;

  // Derive Current Selection for UI
  const selectedGroup = metadata.hierarchicalCountries.find(
    (g) => String(g.id) === String(filters.ultimateEntity)
  );

  const showSecondaryFilter = selectedGroup && selectedGroup.isComposite;

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.filterInputRow}>
        {/* Search */}
        <div className={styles.searchBox}>
          <label className={styles.filterLabel}>
            <Search size={16} /> Search
          </label>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Find coins by name, subject, or KM#..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
            {filters.search && (
              <button
                className={styles.clearSearch}
                onClick={() => updateFilter("search", "")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter: Owned */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <CheckCircle size={16} /> Show
          </label>
          <select
            className={styles.filterSelect}
            value={filters.showOwned}
            onChange={(e) => updateFilter("showOwned", e.target.value)}
          >
            <option value="all">All Coins</option>
            <option value="owned">Only Owned</option>
          </select>
        </div>

        {/* Filter: Level 1 (Ultimate Entity) */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Globe size={16} /> Region
          </label>
          <select
            className={styles.filterSelect}
            value={filters.ultimateEntity}
            onChange={handleUltimateChange}
          >
            <option value="">All Regions</option>
            {metadata.hierarchicalCountries.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter: Level 2 (Specific Country) - CONDITIONAL */}
        {showSecondaryFilter && (
          <div className={`${styles.filterGroup} animate-fade-in`}>
            <label className={styles.filterLabel}>
              <MapPin size={16} /> State/City
            </label>
            <select
              className={styles.filterSelect}
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
            >
              <option value="">Select State...</option>
              {selectedGroup.children.map((c) => (
                <option key={c.country_id} value={c.country_id}>
                  {c.country_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter: Period (Locked until Country is valid) */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Calendar size={16} /> Period
          </label>
          <select
            className={styles.filterSelect}
            value={filters.period}
            onChange={(e) => updateFilter("period", e.target.value)}
            // DISABLED if we have an Ultimate Entity but NO specific Country yet (Composite Pending state)
            // OR if no Ultimate Entity selected at all (unless we want to allow period selection globally? Original code disallowed it)
            disabled={!filters.country}
          >
            <option value="">All Periods</option>
            {metadata.periods.map((p) => (
              <option key={p.period_id} value={p.period_id}>
                {p.period_name} {p.period_range ? `(${p.period_range})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Filter: Sort */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <SortAsc size={16} /> Sort By
          </label>
          <select
            className={styles.filterSelect}
            value={isExploreMode ? "" : filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            disabled={isExploreMode}
            title={
              isExploreMode
                ? "Sorting is disabled in Explore mode (randomized selection)"
                : ""
            }
          >
            {isExploreMode && <option value="">Randomized</option>}
            <option value="year_desc">Year (Newest)</option>
            <option value="year_asc">Year (Oldest)</option>
            {/* ENABLE sorting for Grid AND List view */}
            {viewMode !== "table" && (
              <>
                <option value="price_desc">Price (High-Low)</option>
                <option value="price_asc">Price (Low-High)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Tags & View Mode */}
      <div className={styles.filterStatusRow}>
        <div className={styles.activeFiltersBar}>
          <div className={styles.activeFiltersLabel}>
            <Tag size={14} className="text-gold" /> Active Filters:
          </div>
          {hasFilters && (
            <div className={styles.filterTagsList}>
              {activeTags.map((tag) => (
                <button
                  key={tag.key}
                  className={styles.filterTag}
                  onClick={tag.action}
                  title="Click to remove filter"
                >
                  <span>{tag.label}</span>
                  <X size={14} />
                </button>
              ))}
              <button className={styles.clearAllTags} onClick={clearAllFilters}>
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className={styles.viewToggles}>
          <button
            onClick={() => setViewMode("grid")}
            className={`${styles.toggleBtn} ${
              viewMode === "grid" ? styles.active : ""
            }`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`${styles.toggleBtn} ${
              viewMode === "list" ? styles.active : ""
            }`}
            title="List View"
          >
            <ListIcon size={20} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`${styles.toggleBtn} ${
              viewMode === "table" ? styles.active : ""
            }`}
            title="Table View"
          >
            <TableIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
