/* src/app/page.js */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import CoinGallery from "../components/CoinGallery";
import CoinModal from "../components/CoinModal";
import AddCoinModal from "../components/AddCoinModal";
import { useCoins } from "../hooks/useCoins";

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
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [initialAddCoin, setInitialAddCoin] = useState(null); // New: For pre-selecting coin

  // View State
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

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.reload();
  };

  const isExploreMode = !filters.search && !filters.country && !filters.period && filters.showOwned === "all";

  // Handler for "Add Coin" click from within CoinModal
  const handleAddFromModal = (coin) => {
    setSelectedCoin(null); // Close detail modal
    setInitialAddCoin(coin); // Set the coin to add
    setIsAddModalOpen(true); // Open add modal
  };

  return (
    <main style={mainStyle}>
      <Header
        ownedCount={ownedCount}
        displayCount={coins.length}
        totalCoins={totalCoins}
        onAddCoin={() => {
          setInitialAddCoin(null); // Clear previous selection
          setIsAddModalOpen(true);
        }}
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

      {/* Detail Modal */}
      {selectedCoin && (
        <CoinModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
          session={session}
          onAddCoin={handleAddFromModal}
        />
      )}

      {/* Add Coin Modal */}
      {isAddModalOpen && session && (
        <AddCoinModal
          onClose={() => {
            setIsAddModalOpen(false);
            setInitialAddCoin(null);
          }}
          onCoinAdded={refetch}
          userId={session.user.id}
          initialCoin={initialAddCoin}
        />
      )}
    </main>
  );
}