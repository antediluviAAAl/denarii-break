"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

// --- Fetcher Function ---
async function fetchCoinDetails(coinId) {
  // 1. Fetch Catalog Data (Generic)
  const { data: coinData, error } = await supabase
    .from("f_coins")
    .select(
      `*,
      d_period!inner(period_name, period_link),
      d_series(series_name, series_link, series_range),
      d_categories(type_name),
      d_denominations(denomination_name)`
    )
    .eq("coin_id", coinId)
    .single();

  if (error) throw error;
  if (!coinData) return null;

  // 2. Fetch Owned Data (Specific to User)
  const { data: ownedData } = await supabase
    .from("d_coins_owned")
    .select("*")
    .eq("coin_id", coinId)
    .maybeSingle();

  // 3. Robust Country Fetch
  let countryName = "Unknown";
  if (coinData.period_id) {
    try {
      const { data: linkData } = await supabase
        .from("b_periods_countries")
        .select("country_id")
        .eq("period_id", coinData.period_id)
        .limit(1)
        .maybeSingle();

      if (linkData) {
        const { data: countryData } = await supabase
          .from("d_countries")
          .select("country_name")
          .eq("country_id", linkData.country_id)
          .single();
        if (countryData) countryName = countryData.country_name;
      }
    } catch (err) {
      console.error("Country fetch warning:", err);
    }
  }

  // 4. Merge & Normalize Images
  // We prioritize Owned Images -> Catalog Images
  let finalImages = {
    obverse: { medium: null, original: null, full: null },
    reverse: { medium: null, original: null, full: null },
  };

  if (ownedData) {
    // User Owned Images
    finalImages.obverse = {
      full: ownedData.url_obverse,
      medium: ownedData.medium_url_obverse || ownedData.url_obverse,
      original: ownedData.original_path_obverse, // or url_obverse
    };
    finalImages.reverse = {
      full: ownedData.url_reverse,
      medium: ownedData.medium_url_reverse || ownedData.url_reverse,
      original: ownedData.original_path_reverse,
    };
  } else {
    // Catalog Images
    finalImages.obverse = {
      medium: coinData.image_url_obverse,
      original: coinData.image_url_obverse,
      full: coinData.image_url_obverse,
    };
    finalImages.reverse = {
      medium: coinData.image_url_reverse,
      original: coinData.image_url_reverse,
      full: coinData.image_url_reverse,
    };
  }

  return {
    ...coinData,
    countryName,
    is_owned: !!ownedData,
    images: finalImages,
  };
}

// --- Hook ---
export function useCoinModal(coinId) {
  return useQuery({
    queryKey: ["coin_detail", coinId],
    queryFn: () => fetchCoinDetails(coinId),
    enabled: !!coinId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}
