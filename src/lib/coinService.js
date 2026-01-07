/* src/lib/coinService.js */
import { supabase } from "./supabaseClient";

// --- CONFIG ---
const EXPLORE_DISTRIBUTION = [
  { typeId: 1, target: 60 },
  { typeId: 2, target: 50 },
  { typeId: 3, target: 50 },
  { typeId: 4, target: 20 },
  { typeId: 5, target: 10 },
  { typeId: 6, target: 10 },
];

const SELECT_COINS_FIELDS = `
  coin_id, name, year, price_usd, km, subject, 
  type_id, period_id, denomination_id, series_id,
  marked, 
  d_denominations(denomination_name, denomination_shorthand),
  d_period(period_name, period_start_year, period_link),
  d_series(series_name, series_range, series_link)
`;

export const fetchMetadata = async () => {
  const countPromises = EXPLORE_DISTRIBUTION.map(async (dist) => {
    const { count } = await supabase
      .from("f_coins")
      .select("*", { count: "exact", head: true })
      .eq("type_id", dist.typeId);
    return { typeId: dist.typeId, count: count || 0 };
  });

  // Fetch Countries (now with coin_count column)
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

  return {
    countries: countries.data || [],
    categories: categories.data || [],
    periodLinks: periodLinks.data || [],
    typeCounts,
  };
};

// NEW: Fetches the raw flat list for the Period Hierarchy
// UPDATED: Now selects period_shorthand, period_range, and ultimate_entity_id
export const fetchPeriodHierarchy = async () => {
  const { data, error } = await supabase
    .from("d_period")
    .select(`
      period_id,
      period_name,
      period_shorthand,
      period_start_year,
      period_range,
      b_periods_countries!inner (
        country_id,
        d_countries (
          country_name,
          ultimate_entity_id
        )
      )
    `);

  if (error) {
    console.error("Error fetching period hierarchy:", error);
    return [];
  }
  return data;
};

export const fetchOwnedCoins = async () => {
  const { data } = await supabase.from("d_coins_owned").select(`
      coin_id, 
      url_obverse, url_reverse, 
      medium_url_obverse, medium_url_reverse, 
      thumb_url_obverse, thumb_url_reverse,
      f_coins!inner(period_id)
  `);
  return data || [];
};

export const fetchPeriods = async (countryId) => {
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

export const fetchExploreCoins = async ({ typeCounts }) => {
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
  return results.flat();
};

export const fetchCoins = async ({ filters, ownedIds, filterPeriodIds }) => {
  let query = supabase.from("f_coins").select(SELECT_COINS_FIELDS);
  
  if (filters.showOwned === "owned") query = query.in("coin_id", ownedIds);
  if (filters.search)
    query = query.or(
      `name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,km.ilike.%${filters.search}%`
    );
  
  if (filters.country && !filters.period && filterPeriodIds)
    query = query.in("period_id", filterPeriodIds);
  
  if (filters.period) query = query.eq("period_id", filters.period);

  const sortMap = {
    year_desc: { col: "year", asc: false },
    year_asc: { col: "year", asc: true },
    price_desc: { col: "price_usd", asc: false },
    price_asc: { col: "price_usd", asc: true },
  };
  const sort = sortMap[filters.sortBy] || sortMap.year_desc;
  query = query.order(sort.col, { ascending: sort.asc });

  const BATCH_SIZE = 1000;
  let rawData = [];
  let from = 0;
  let fetching = true;

  while (fetching) {
    const { data, error } = await query.range(from, from + BATCH_SIZE - 1);
    if (error) throw error;
    if (data && data.length > 0) {
      rawData = [...rawData, ...data];
      if (data.length < BATCH_SIZE) fetching = false;
      else from += BATCH_SIZE;
    } else {
      fetching = false;
    }
  }
  return rawData;
};

// --- NEW: STATS FETCHING (Server Side) ---
export const getDenariiStats = async () => {
  try {
    const { data, error } = await supabase
      .from("d_stats")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.warn("Error fetching stats, defaulting to zero:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Unexpected error in getDenariiStats:", err);
    return null;
  }
};