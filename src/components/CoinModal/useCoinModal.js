"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

// --- Fetcher Function ---
async function fetchCoinDetails(coinId) {
  // 1. Fetch Coin & Relations (Deep Fetch)
  const { data, error } = await supabase
    .from("f_coins")
    .select(
      `
      *,
      d_period!inner(period_name, period_link),
      d_series(series_name, series_link, series_range),
      d_categories(type_name),
      d_denominations(denomination_name)
    `
    )
    .eq("coin_id", coinId)
    .single();

  if (error) throw error;
  if (!data) return null;

  // 2. Robust Country Fetch (2-Step Strategy)
  let countryName = "Unknown";

  if (data.period_id) {
    try {
      // Step A: Find the Country ID for this Period
      const { data: linkData, error: linkError } = await supabase
        .from("b_periods_countries")
        .select("country_id")
        .eq("period_id", data.period_id)
        .limit(1)
        .maybeSingle();

      if (linkData) {
        // Step B: Fetch the Country Name using the ID
        const { data: countryData } = await supabase
          .from("d_countries")
          .select("country_name")
          .eq("country_id", linkData.country_id)
          .single();

        if (countryData) {
          countryName = countryData.country_name;
        }
      }
    } catch (err) {
      console.error("Country fetch warning:", err);
    }
  }

  return { ...data, countryName };
}

// --- Hook ---
export function useCoinModal(coinId) {
  return useQuery({
    queryKey: ["coin_detail", coinId],
    queryFn: () => fetchCoinDetails(coinId),
    enabled: !!coinId,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}
