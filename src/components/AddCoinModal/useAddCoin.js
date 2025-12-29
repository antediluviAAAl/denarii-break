"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * Hook managing the 2-step process:
 * 1. Search for a coin in `f_coins`
 * 2. Upload images and insert into `d_coins_owned`
 */
export function useAddCoin(onClose, onCoinAdded, userId) {
  const [step, setStep] = useState(1); // 1: Search, 2: Upload
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [obverseFile, setObverseFile] = useState(null);
  const [reverseFile, setReverseFile] = useState(null);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("f_coins")
        .select("coin_id, name, year, km, price_usd")
        .ilike("name", `%${searchQuery}%`)
        .limit(10);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedCoin || !userId) return;
    setUploading(true);

    try {
      // 1. Upload Images (if provided)
      let obversePath = null;
      let reversePath = null;

      if (obverseFile) {
        const fileName = `${userId}/${selectedCoin.coin_id}_obv_${Date.now()}`;
        const { data, error } = await supabase.storage
          .from("user_coins")
          .upload(fileName, obverseFile);
        if (!error) obversePath = data.path;
      }

      if (reverseFile) {
        const fileName = `${userId}/${selectedCoin.coin_id}_rev_${Date.now()}`;
        const { data, error } = await supabase.storage
          .from("user_coins")
          .upload(fileName, reverseFile);
        if (!error) reversePath = data.path;
      }

      // 2. Insert Record
      const { error: insertError } = await supabase
        .from("d_coins_owned")
        .insert({
          coin_id: selectedCoin.coin_id,
          user_id: userId,
          original_path_obverse: obversePath,
          original_path_reverse: reversePath,
          // In a real app, you'd trigger a server function to generate thumbs
        });

      if (insertError) throw insertError;

      // 3. Cleanup & Close
      if (onCoinAdded) onCoinAdded();
      onClose();
    } catch (err) {
      console.error("Error adding coin:", err);
      alert("Failed to add coin. Check console.");
    } finally {
      setUploading(false);
    }
  };

  return {
    step,
    searchQuery,
    setSearchQuery,
    results,
    loading,
    selectedCoin,
    handleSelectCoin,
    setObverseFile,
    setReverseFile,
    handleSubmit,
    uploading,
  };
}