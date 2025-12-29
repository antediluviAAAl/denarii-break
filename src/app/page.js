/* src/app/page.js */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import CoinGallery from "../components/CoinGallery";
// REMOVE: import CoinModal ...
import AddCoinModal from "../components/AddCoinModal";
import { useCoins } from "../hooks/useCoins";

// ... styles ...

export default function Home() {
  const [session, setSession] = useState(null);

  // Only Global Add Modal State remains
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // REMOVE: const [selectedCoin, setSelectedCoin] = useState(null);
  // REMOVE: const [initialAddCoin, setInitialAddCoin] = useState(null);

  const [viewMode, setViewMode] = useState("grid");

  const {
    coins,
    loading,
    filters,
    setFilters,
    metadata,
    totalCoins,
    ownedCount,
    refetch,
  } = useCoins(session?.user?.id);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.reload();
  };

  const isExploreMode =
    !filters.search &&
    !filters.country &&
    !filters.period &&
    filters.showOwned === "all";

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        ownedCount={ownedCount}
        displayCount={coins.length}
        totalCoins={totalCoins}
        onAddCoin={() => setIsAddModalOpen(true)}
        session={session}
        onLogout={handleLogout}
      />

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        metadata={metadata}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isExploreMode={isExploreMode}
      />

      <CoinGallery
        coins={coins}
        loading={loading}
        categories={metadata.categories}
        // REMOVE: onCoinClick={setSelectedCoin}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={filters.sortBy}
      />

      {/* REMOVE: CoinModal rendering */}

      {/* Global Add Modal (Header Button) */}
      {isAddModalOpen && session && (
        <AddCoinModal
          onClose={() => setIsAddModalOpen(false)}
          onCoinAdded={refetch}
          userId={session.user.id}
          initialCoin={null} // Always null from header
        />
      )}
    </main>
  );
}
