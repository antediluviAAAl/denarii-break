/* src/components/AddCoinModal/useAddCoin.js */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { addCoinToCollection } from "../../app/actions";

export function useAddCoin(onClose, onCoinAdded, userId, initialCoin = null) {
  // If initialCoin exists, start at Step 2 (Upload), else Step 1 (Search)
  const [step, setStep] = useState(initialCoin ? 2 : 1);
  const [selectedCoin, setSelectedCoin] = useState(initialCoin);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  
  // NEW: Store owned IDs in a Set for fast lookup (Fixes the crash)
  const [ownedSet, setOwnedSet] = useState(new Set());
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Owned Coins (IDs only) to populate the Set
  useEffect(() => {
    if (!userId) return;

    const fetchOwnedIDs = async () => {
      const { data } = await supabase
        .from("d_coins_owned")
        .select("coin_id");

      if (data) {
        setOwnedSet(new Set(data.map(row => row.coin_id)));
      }
    };

    fetchOwnedIDs();
  }, [userId]);

  // 2. Handle Initial Coin Prop
  useEffect(() => {
    if (initialCoin) {
      setSelectedCoin(initialCoin);
      setStep(2);
    }
  }, [initialCoin]);

  // 3. Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);

      const { data } = await supabase
        .from("f_coins")
        .select("coin_id, name, year, km, subject, d_period(period_shorthand), d_denominations(denomination_name)")
        .or(`name.ilike.%${searchQuery}%,km.ilike.%${searchQuery}%`)
        .limit(10);

      setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setStep(2);
  };

  const handleBackToSearch = () => {
    setStep(1);
    setSelectedCoin(null);
    setSearchQuery("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCoin || !userId) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      formData.append("coin_id", selectedCoin.coin_id);

      const result = await addCoinToCollection(formData);

      if (result.success) {
        if (onCoinAdded) onCoinAdded();
        setOwnedSet(prev => new Set(prev).add(selectedCoin.coin_id));
        onClose();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
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
    handleBackToSearch,
    handleSubmit,
    isSubmitting,
    ownedSet // Exported for the View
  };
}