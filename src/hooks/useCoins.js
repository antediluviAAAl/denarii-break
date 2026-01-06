/* src/hooks/useCoins.js */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import * as coinService from "../lib/coinService";
import {
  processCoinData,
  shuffleArray,
  buildHierarchy,
  buildPeriodHierarchy,
} from "../utils/dataUtils";

export function useCoins(options = { fetchCoins: true }) {
  const searchParams = useSearchParams();

  // 1. STATE MANAGEMENT
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    ultimateEntity: searchParams.get("ultimateEntity") || "",
    country: searchParams.get("country") || "",
    period: searchParams.get("period") || "",
    denomination: "",
    series: "",
    showOwned: searchParams.get("showOwned") || "all",
    sortBy: "year_desc",
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const isExploreMode =
    !filters.search &&
    !filters.ultimateEntity &&
    !filters.country &&
    !filters.period &&
    filters.showOwned === "all";

  // 2. DATA FETCHING (Delegated to Service)
  const { data: metaDataRaw } = useQuery({
    queryKey: ["metadata"],
    queryFn: coinService.fetchMetadata,
    staleTime: Infinity,
  });

  // NEW: Fetch Period Hierarchy (Lazily or eager based on needs)
  // We fetch it eagerly here to ensure the Hub modal works instantly.
  const { data: rawPeriodHierarchy } = useQuery({
    queryKey: ["periodHierarchy"],
    queryFn: coinService.fetchPeriodHierarchy,
    staleTime: Infinity,
  });

  const { data: ownedDataRaw, refetch: refetchOwned } = useQuery({
    queryKey: ["owned"],
    queryFn: coinService.fetchOwnedCoins,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch specific periods for a selected country (used in filters)
  const { data: periods } = useQuery({
    queryKey: ["periods", filters.country],
    queryFn: () => coinService.fetchPeriods(filters.country),
    enabled: !!filters.country,
    staleTime: 1000 * 60 * 30,
  });

  // 3. DATA PROCESSING
  const ownedCache = useMemo(() => {
    if (!ownedDataRaw) return {};
    const cache = {};
    ownedDataRaw.forEach((c) => {
      cache[c.coin_id] = {
        full: { obverse: c.url_obverse, reverse: c.url_reverse },
        medium: {
          obverse: c.medium_url_obverse,
          reverse: c.medium_url_reverse,
        },
        thumb: { obverse: c.thumb_url_obverse, reverse: c.thumb_url_reverse },
      };
    });
    return cache;
  }, [ownedDataRaw]);

  const ownedIds = useMemo(() => Object.keys(ownedCache), [ownedCache]);

  const ownedPeriodIds = useMemo(() => {
    if (!ownedDataRaw) return new Set();
    const ids = new Set();
    ownedDataRaw.forEach((c) => {
      if (c.f_coins?.period_id) ids.add(c.f_coins.period_id);
    });
    return ids;
  }, [ownedDataRaw]);

  const validCountryIds = useMemo(() => {
    if (
      filters.showOwned !== "owned" ||
      !ownedPeriodIds ||
      !metaDataRaw?.periodLinks
    )
      return null;
    const validIds = new Set();
    metaDataRaw.periodLinks.forEach((link) => {
      if (ownedPeriodIds.has(link.period_id)) validIds.add(link.country_id);
    });
    return validIds;
  }, [filters.showOwned, ownedPeriodIds, metaDataRaw]);

  // Build Country Tree
  const displayedHierarchy = useMemo(() => {
    if (!metaDataRaw?.countries) return [];
    const fullHierarchy = buildHierarchy(metaDataRaw.countries);

    if (!validCountryIds) return fullHierarchy;

    return fullHierarchy
      .map((group) => {
        const validChildren = group.children.filter((c) =>
          validCountryIds.has(c.country_id)
        );
        if (validChildren.length === 0) return null;
        return { ...group, children: validChildren };
      })
      .filter(Boolean);
  }, [metaDataRaw, validCountryIds]);

  // NEW: Build Period Tree
  const hierarchicalPeriods = useMemo(() => {
    if (!rawPeriodHierarchy) return [];
    return buildPeriodHierarchy(rawPeriodHierarchy);
  }, [rawPeriodHierarchy]);

  // 4. MAIN COIN QUERY
  const {
    data: coins,
    isLoading: coinsLoading,
    isFetching,
    refetch: refetchCoins,
  } = useQuery({
    queryKey: [
      "coins",
      {
        ...filters,
        search: debouncedSearch,
        mode: isExploreMode ? "explore" : "filter",
      },
    ],
    queryFn: async () => {
      if (isExploreMode && metaDataRaw?.typeCounts) {
        const rawCoins = await coinService.fetchExploreCoins({
          typeCounts: metaDataRaw.typeCounts,
        });
        const shuffled = shuffleArray(rawCoins);
        return shuffled.map((c) => processCoinData(c, ownedCache));
      }

      let filterPeriodIds = null;
      if (filters.country && !filters.period && metaDataRaw?.periodLinks) {
        filterPeriodIds = metaDataRaw.periodLinks
          .filter((l) => l.country_id == filters.country)
          .map((l) => l.period_id);
      }

      const rawCoins = await coinService.fetchCoins({
        filters: { ...filters, search: debouncedSearch },
        ownedIds,
        filterPeriodIds,
      });

      return rawCoins.map((c) => processCoinData(c, ownedCache));
    },
    enabled: !!ownedDataRaw && !!metaDataRaw && options.fetchCoins,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const refetch = async () => {
    await Promise.all([refetchOwned(), refetchCoins()]);
  };

  return {
    coins: coins || [],
    loading: coinsLoading || isFetching || !ownedDataRaw,
    filters,
    setFilters,
    metadata: {
      countries: metaDataRaw?.countries || [],
      hierarchicalCountries: displayedHierarchy,
      hierarchicalPeriods: hierarchicalPeriods, // NEW FIELD
      categories: metaDataRaw?.categories || [],
      periods: periods || [],
      validCountryIds,
    },
    totalCoins: 264962,
    ownedCount: ownedDataRaw?.length || 0,
    ownedIds,
    refetch,
    isExploreMode,
  };
}
