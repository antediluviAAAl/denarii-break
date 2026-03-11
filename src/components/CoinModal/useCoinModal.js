/* src/components/CoinModal/useCoinModal.js */
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

async function fetchCoinDetails(coinId) {
  // 1. Fetch Catalog Data
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

  // 2. Fetch Owned Data
  const { data: ownedData } = await supabase
    .from("d_coins_owned")
    .select("*")
    .eq("coin_id", coinId)
    .maybeSingle();

  // 3. Country Fetch (Smart Hierarchy Resolution)
  let countryName = "Unknown";
  let parentCountryName = null;
  let secondaryCountryName = null;

  if (coinData.period_id) {
    try {
      // Fetch all countries linked to this period (handles overlaps like Prussia/Empire)
      const { data: links } = await supabase
        .from("b_periods_countries")
        .select("country_id")
        .eq("period_id", coinData.period_id);

      if (links && links.length > 0) {
        const countryIds = links.map(l => l.country_id);
        const { data: countries } = await supabase
          .from("d_countries")
          .select("country_name, parent_name")
          .in("country_id", countryIds);

        if (countries && countries.length > 0) {
          // Clean period name: "Prussia (1871-1918)" -> "Prussia"
          const cleanPeriod = coinData.d_period?.period_name
            ? coinData.d_period.period_name.split('(')[0].trim().toLowerCase()
            : "";

          // Find the country that explicitly matches the period identity
          const identityMatch = countries.find(c => 
            c.country_name?.toLowerCase() === cleanPeriod
          );

          let mainCountry = identityMatch || countries[0];
          
          countryName = mainCountry.country_name;
          parentCountryName = mainCountry.parent_name !== countryName ? mainCountry.parent_name : null;

          // If there's an overlap (multiple countries), set the other as secondary
          if (countries.length > 1) {
            const secondary = countries.find(c => c.country_name !== countryName);
            if (secondary) secondaryCountryName = secondary.country_name;
          }
        }
      }
    } catch (err) {
      console.error("Country fetch warning:", err);
    }
  }

  // 4. Images Logic: Only return images if Owned.
  let finalImages = {
    obverse: { medium: null, original: null, full: null },
    reverse: { medium: null, original: null, full: null },
  };

  if (ownedData) {
    finalImages.obverse = {
      full: ownedData.url_obverse,
      medium: ownedData.medium_url_obverse || ownedData.url_obverse,
      original: ownedData.original_path_obverse,
    };
    finalImages.reverse = {
      full: ownedData.url_reverse,
      medium: ownedData.medium_url_reverse || ownedData.url_reverse,
      original: ownedData.original_path_reverse,
    };
  }

  return {
    ...coinData,
    countryName, // "Prussia"
    parentCountryName, // "German States" (or null)
    secondaryCountryName, // "German Empire" (or null)
    is_owned: !!ownedData,
    images: finalImages,
  };
}

export function useCoinModal(coinId) {
  return useQuery({
    queryKey: ["coin_detail", coinId],
    queryFn: () => fetchCoinDetails(coinId),
    enabled: !!coinId,
    staleTime: 1000 * 60 * 5,
  });
}
