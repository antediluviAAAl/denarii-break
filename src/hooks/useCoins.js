/* src/hooks/useCoins.js */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

// --- CONFIGURATION ---

const EXPLORE_DISTRIBUTION = [
  { typeId: 1, target: 60 }, // Circulation
  { typeId: 2, target: 50 }, // Commemorative
  { typeId: 3, target: 50 }, // Collector
  { typeId: 4, target: 20 }, // Tokens
  { typeId: 5, target: 10 }, // Notgelds
  { typeId: 6, target: 10 }, // Notgelds (Probes)
];

const SELECT_COINS_FIELDS = `
  coin_id, name, year, price_usd, km, subject, 
  type_id, period_id, denomination_id, series_id,
  marked, 
  d_denominations(denomination_name, denomination_shorthand),
  d_period(period_name, period_start_year, period_link),
  d_series(series_name, series_range, series_link)
`;

// --- HELPERS ---

const processCoinData = (coin, ownedCache) => {
  const ownedData = ownedCache[coin.coin_id];
  const getImages = (side) => {
    if (!ownedData) return { full: null, medium: null, thumb: null };
    const full = ownedData.full[side];
    const medium = ownedData.medium[side] || full;
    const thumb = ownedData.thumb[side] || medium || full;
    return { full, medium, thumb };
  };

  return {
    ...coin,
    is_owned: !!ownedData,
    images: {
      obverse: getImages("obverse"),
      reverse: getImages("reverse"),
    },
  };
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// --- FETCHERS ---

// 1. Fetch Metadata (Includes Hierarchy Processing)
const fetchMetadata = async () => {
  const countPromises = EXPLORE_DISTRIBUTION.map(async (dist) => {
    const { count } = await supabase
      .from("f_coins")
      .select("*", { count: "exact", head: true })
      .eq("type_id", dist.typeId);
    return { typeId: dist.typeId, count: count || 0 };
  });

  const [countries, categories, periodLinks, ...typeCountsResults] =
    await Promise.all([
      supabase.from("d_countries").select("*").order("country_name"),
      supabase.from("d_categories").select("*").order("type_name"),
      supabase.from("b_periods_countries").select("period_id, country_id"),
      ...countPromises,
    ]);

  const typeCounts = typeCountsResults.reduce((acc, curr) => {
    acc[curr.typeId] = curr.count;
    return acc;
  }, {});

  // --- HIERARCHY PROCESSING ---
  const rawCountries = countries.data || [];
  const hierarchyMap = {};

  rawCountries.forEach((c) => {
    const ultId = c.ultimate_entity_id;
    if (!hierarchyMap[ultId]) {
      hierarchyMap[ultId] = {
        id: ultId,
        name: c.ultimate_entity_name,
        isComposite: false, // Default
        children: [],
      };
    }

    // Check user logic: if ultimate name matches parent name, it's a composite entity (e.g. German States)
    // We check if THIS child implies the group is composite
    if (c.parent_name === c.ultimate_entity_name) {
      hierarchyMap[ultId].isComposite = true;
    }

    hierarchyMap[ultId].children.push(c);
  });

  // Sort children alphabetically within each group
  Object.values(hierarchyMap).forEach((group) => {
    group.children.sort((a, b) => a.country_name.localeCompare(b.country_name));
  });

  // Convert to array and sort by Ultimate Name
  const hierarchicalCountries = Object.values(hierarchyMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return {
    countries: rawCountries,
    hierarchicalCountries,
    categories: categories.data || [],
    periodLinks: periodLinks.data || [],
    typeCounts,
  };
};

// 2. Fetch Owned Coins
const fetchOwnedCoins = async () => {
  const { data } = await supabase.from("d_coins_owned").select(`
      coin_id, 
      url_obverse, url_reverse, 
      medium_url_obverse, medium_url_reverse, 
      thumb_url_obverse, thumb_url_reverse,
      f_coins!inner(period_id)
      `);

  const cache = {};
  const ownedPeriodIds = new Set();

  (data || []).forEach((c) => {
    if (c.f_coins?.period_id) {
      ownedPeriodIds.add(c.f_coins.period_id);
    }
    cache[c.coin_id] = {
      full: { obverse: c.url_obverse, reverse: c.url_reverse },
      medium: { obverse: c.medium_url_obverse, reverse: c.medium_url_reverse },
      thumb: { obverse: c.thumb_url_obverse, reverse: c.thumb_url_reverse },
    };
  });
  return { cache, count: data?.length || 0, ownedPeriodIds };
};

// 3. Fetch Periods
const fetchPeriods = async (countryId) => {
  if (!countryId) return [];
  const { data } = await supabase
    .from("b_periods_countries")
    .select(`period_id, d_period!inner(*)`)
    .eq("country_id", countryId);

  const periods = data?.map((d) => d.d_period) || [];
  return periods.sort(
    (a, b) => (b.period_start_year || 0) - (a.period_start_year || 0)
  );
};

// 4. Fetch Explore Coins
const fetchExploreCoins = async ({ typeCounts, ownedCache }) => {
  const queries = EXPLORE_DISTRIBUTION.map(async ({ typeId, target }) => {
    const totalAvailable = typeCounts[typeId] || 0;

    if (totalAvailable <= target) {
      const { data } = await supabase
        .from("f_coins")
        .select(SELECT_COINS_FIELDS)
        .eq("type_id", typeId);
      return data || [];
    }

    const maxOffset = totalAvailable - target;
    const offset = Math.floor(Math.random() * maxOffset);

    const { data } = await supabase
      .from("f_coins")
      .select(SELECT_COINS_FIELDS)
      .eq("type_id", typeId)
      .range(offset, offset + target - 1);

    return data || [];
  });

  const results = await Promise.all(queries);
  const flatCoins = results.flat();
  const shuffledCoins = shuffleArray(flatCoins);

  return shuffledCoins.map((coin) => processCoinData(coin, ownedCache));
};

// 5. Fetch Filtered Coins
const fetchCoins = async ({ filters, ownedCache }) => {
  let filterPeriodIds = null;
  const ownedIds = Object.keys(ownedCache);

  if (filters.showOwned === "owned" && ownedIds.length === 0) return [];

  // SAFETY: If we are in "Composite Pending" mode (Ultimate selected, but Country is null),
  // we return empty because the user hasn't selected a specific child yet.
  if (filters.ultimateEntity && !filters.country) {
    return [];
  }

  if (filters.country && !filters.period) {
    const { data } = await supabase
      .from("b_periods_countries")
      .select("period_id")
      .eq("country_id", filters.country);
    filterPeriodIds = data?.map((p) => p.period_id) || [];
    if (filterPeriodIds.length === 0) return [];
  }

  const buildQuery = () => {
    let query = supabase.from("f_coins").select(SELECT_COINS_FIELDS);

    if (filters.showOwned === "owned") {
      query = query.in("coin_id", ownedIds);
    }
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,km.ilike.%${filters.search}%`
      );
    }
    if (filters.country && !filters.period && filterPeriodIds) {
      query = query.in("period_id", filterPeriodIds);
    }
    if (filters.period) {
      query = query.eq("period_id", filters.period);
    }

    const sortMap = {
      year_desc: { col: "year", asc: false },
      year_asc: { col: "year", asc: true },
      price_desc: { col: "price_usd", asc: false },
      price_asc: { col: "price_usd", asc: true },
    };
    const sort = sortMap[filters.sortBy] || sortMap.year_desc;
    query = query.order(sort.col, { ascending: sort.asc });

    return query;
  };

  const BATCH_SIZE = 1000;
  let rawData = [];
  let from = 0;
  let fetching = true;

  while (fetching) {
    const { data, error } = await buildQuery().range(
      from,
      from + BATCH_SIZE - 1
    );
    if (error) throw error;

    if (data && data.length > 0) {
      rawData = [...rawData, ...data];
      if (data.length < BATCH_SIZE) fetching = false;
      else from += BATCH_SIZE;
    } else {
      fetching = false;
    }
  }

  return rawData.map((coin) => processCoinData(coin, ownedCache));
};

// --- HOOK ---

export function useCoins() {
  const [filters, setFilters] = useState({
    search: "",
    ultimateEntity: "", // Level 1 ID
    country: "", // Level 2 ID (Actual Country ID)
    period: "",
    denomination: "",
    series: "",
    showOwned: "all",
    sortBy: "year_desc",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Explore Mode: No search, no country (Ultimate or Specific), no period
  const isExploreMode =
    !filters.search &&
    !filters.ultimateEntity &&
    !filters.country &&
    !filters.period &&
    filters.showOwned === "all";

  // Queries
  const { data: metaData } = useQuery({
    queryKey: ["metadata"],
    queryFn: fetchMetadata,
    staleTime: Infinity,
  });

  const { data: ownedData } = useQuery({
    queryKey: ["owned"],
    queryFn: fetchOwnedCoins,
    staleTime: 1000 * 60 * 5,
  });

  const ownedIds = useMemo(() => {
    if (!ownedData?.cache) return new Set();
    return new Set(Object.keys(ownedData.cache));
  }, [ownedData]);

  // Valid IDs Calculation
  const validCountryIds = useMemo(() => {
    if (
      filters.showOwned !== "owned" ||
      !ownedData?.ownedPeriodIds ||
      !metaData?.periodLinks
    ) {
      return null;
    }
    const validIds = new Set();
    metaData.periodLinks.forEach((link) => {
      if (ownedData.ownedPeriodIds.has(link.period_id)) {
        validIds.add(link.country_id);
      }
    });
    return validIds;
  }, [filters.showOwned, ownedData, metaData]);

  // Compute Displayed Hierarchy based on Valid IDs
  const displayedHierarchy = useMemo(() => {
    if (!metaData?.hierarchicalCountries) return [];

    // If we are showing all, return everything
    if (!validCountryIds) return metaData.hierarchicalCountries;

    // Filter Hierarchy for "Owned Only" view
    return metaData.hierarchicalCountries
      .map((group) => {
        // Filter children
        const validChildren = group.children.filter((c) =>
          validCountryIds.has(c.country_id)
        );
        if (validChildren.length === 0) return null;

        return {
          ...group,
          children: validChildren,
        };
      })
      .filter(Boolean); // Remove empty groups
  }, [metaData, validCountryIds]);

  const { data: periods } = useQuery({
    queryKey: ["periods", filters.country],
    queryFn: () => fetchPeriods(filters.country),
    enabled: !!filters.country,
    staleTime: 1000 * 60 * 30,
  });

  const {
    data: coins,
    isLoading: coinsLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "coins",
      {
        ...filters,
        search: debouncedSearch,
        mode: isExploreMode ? "explore" : "filter",
      },
    ],
    queryFn: () => {
      if (isExploreMode && metaData?.typeCounts) {
        return fetchExploreCoins({
          typeCounts: metaData.typeCounts,
          ownedCache: ownedData.cache || {},
        });
      }
      return fetchCoins({
        filters: { ...filters, search: debouncedSearch },
        ownedCache: ownedData?.cache || {},
      });
    },
    enabled: !!ownedData && !!metaData,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  return {
    coins: coins || [],
    loading: coinsLoading || isFetching || !ownedData,
    filters,
    setFilters,
    metadata: {
      countries: metaData?.countries || [],
      hierarchicalCountries: displayedHierarchy, // EXPORTED FOR UI
      categories: metaData?.categories || [],
      periods: periods || [],
      validCountryIds,
    },
    ownedCount: ownedData?.count || 0,
    ownedIds,
    isExploreMode,
  };
}
