/* src/app/page.js */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header"; // Resolves to Header/index.jsx
import FilterBar from "../components/FilterBar"; // Resolves to FilterBar/index.jsx
import CoinGallery from "../components/CoinGallery"; // Resolves to CoinGallery/index.jsx
import CoinModal from "../components/CoinModal"; // Resolves to CoinModal/index.jsx
import AddCoinModal from "../components/AddCoinModal"; // Resolves to AddCoinModal/index.jsx
import { useCoins } from "../hooks/useCoins";

// Minimal inline style for the main wrapper to handle sticky behavior correctly
const mainStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "0",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

export default function Home() {
  const [session, setSession] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  
  // View State (Lifted to Page level so FilterBar and Gallery can share it)
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'list', 'table'

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.reload();
  };

  // Determine if we are in "Explore Mode" (No specific filters active)
  const isExploreMode =
    !filters.search && !filters.country && !filters.period && filters.showOwned === "all";

  return (
    <main style={mainStyle}>
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
        onCoinClick={setSelectedCoin}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={filters.sortBy}
      />

      {/* Modals */}
      {selectedCoin && (
        <CoinModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}

      {isAddModalOpen && session && (
        <AddCoinModal
          onClose={() => setIsAddModalOpen(false)}
          onCoinAdded={refetch}
          userId={session.user.id}
        />
      )}
    </main>
  );
}