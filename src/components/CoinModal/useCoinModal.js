"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useCoinModal(coin) {
  const [countryName, setCountryName] = useState(null);
  const [loadingCountry, setLoadingCountry] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCountry() {
      // If we already have the country object on the coin, use it.
      if (coin?.d_countries?.country_name) {
        setCountryName(coin.d_countries.country_name);
        return;
      }
      
      // Fallback: Fetch via country_id
      if (coin?.country_id) {
        setLoadingCountry(true);
        const { data, error } = await supabase
          .from("d_countries")
          .select("country_name")
          .eq("country_id", coin.country_id)
          .single();

        if (isMounted && !error && data) {
          setCountryName(data.country_name);
        }
        if (isMounted) setLoadingCountry(false);
      }
    }

    if (coin) {
      fetchCountry();
    }

    return () => {
      isMounted = false;
    };
  }, [coin]);

  return { countryName, loadingCountry };
}