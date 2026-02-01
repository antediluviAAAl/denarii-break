/* src/hooks/useMetalHistory.js */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useMetalHistory(symbol = "XAG", range, isOpen) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derived Stats
  const prices = data.map((d) => d.price);
  const currentPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
  const startPrice = prices.length > 0 ? prices[0] : 0;

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const percentChange =
    startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const isPositive = percentChange >= 0;

  useEffect(() => {
    if (!isOpen) return;

    async function fetchHistory() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("d_metal_price")
          .select("date, price")
          .eq("symbol", symbol)
          .order("date", { ascending: true });

        // Date Math
        const now = new Date();
        let cutoffDate = new Date();

        switch (range) {
          case "7D":
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case "1M":
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case "3M":
            cutoffDate.setMonth(now.getMonth() - 3);
            break;
          case "1Y":
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
          case "3Y":
            cutoffDate.setFullYear(now.getFullYear() - 3);
            break;
          case "5Y":
            cutoffDate.setFullYear(now.getFullYear() - 5);
            break;
          default:
            cutoffDate.setMonth(now.getMonth() - 1);
        }

        if (cutoffDate) {
          query = query.gte("date", cutoffDate.toISOString());
        }

        query = query.limit(3000);

        const { data: result, error: err } = await query;
        if (err) throw err;

        // Downsample logic (Performance)
        let rawData = result || [];
        const MAX_POINTS = 2000;
        if (rawData.length > MAX_POINTS) {
          const step = Math.ceil(rawData.length / MAX_POINTS);
          rawData = rawData.filter(
            (_, i) => i === 0 || i === rawData.length - 1 || i % step === 0
          );
        }

        const formattedData = rawData.map((row) => {
          const d = new Date(row.date);
          const day = String(d.getDate()).padStart(2, "0");
          const month = d.toLocaleString("en-US", { month: "short" });
          const year = String(d.getFullYear()).slice(-2);
          return {
            date: `${day}-${month}-${year}`,
            isoDate: row.date,
            price: Number(row.price),
          };
        });

        setData(formattedData);
      } catch (err) {
        console.error(`${symbol} fetch error:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [symbol, range, isOpen]);

  return {
    data,
    loading,
    error,
    currentPrice,
    minPrice,
    maxPrice,
    percentChange,
    isPositive,
  };
}