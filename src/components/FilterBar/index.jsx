"use client";

import { useEffect } from "react";
import {
  Search,
  X,
  CheckCircle,
  Globe,
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
      if (key === "country") return { ...prev, [key]: value, period: "" };
      return { ...prev, [key]: value };
    });
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
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
    if (filters.country) {
      const countryName =
        metadata.countries.find((c) => c.country_id == filters.country)
          ?.country_name || "Unknown Country";
      tags.push({
        key: "country",
        label: countryName,
        action: () => updateFilter("country", ""),
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

  const displayedCountries = metadata.countries.filter((c) => {
    if (!metadata.validCountryIds) return true;
    return metadata.validCountryIds.has(c.country_id);
  });

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

        {/* Filters */}
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

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Globe size={16} /> Country
          </label>
          <select
            className={styles.filterSelect}
            value={filters.country}
            onChange={(e) => updateFilter("country", e.target.value)}
          >
            <option value="">All Countries</option>
            {displayedCountries.map((c) => (
              <option key={c.country_id} value={c.country_id}>
                {c.country_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Calendar size={16} /> Period
          </label>
          <select
            className={styles.filterSelect}
            value={filters.period}
            onChange={(e) => updateFilter("period", e.target.value)}
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
