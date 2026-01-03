/* src/app/page.js */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import CoinGallery from "../components/CoinGallery";
import AddCoinModal from "../components/AddCoinModal";
import SilverChartModal from "../components/SilverChartModal";
import Footer from "../components/Footer";
import { useCoins } from "../hooks/useCoins";

export default function Home() {
  const [session, setSession] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSilverModalOpen, setIsSilverModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState("grid");

  const {
    coins,
    loading,
    filters,
    setFilters,
    metadata,
    totalCoins,
    ownedCount,
    ownedIds, // NEW: Grab the set of owned IDs
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--light-bg)",
      }}
    >
      <Header
        ownedCount={ownedCount}
        displayCount={coins.length}
        totalCoins={totalCoins}
        onAddCoin={() => setIsAddModalOpen(true)}
        onOpenSilver={() => setIsSilverModalOpen(true)}
        session={session}
        onLogout={handleLogout}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0",
        }}
      >
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
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={filters.sortBy}
        />

        {/* Global Add Modal */}
        {isAddModalOpen && session && (
          <AddCoinModal
            onClose={() => setIsAddModalOpen(false)}
            onCoinAdded={refetch}
            userId={session.user.id}
            initialCoin={null}
            ownedIds={ownedIds} // NEW: Pass the set to the modal
          />
        )}

        {/* Silver Chart Modal */}
        {isSilverModalOpen && (
          <SilverChartModal onClose={() => setIsSilverModalOpen(false)} />
        )}
      </main>

      {/* FOOTER */}
      <Footer session={session} onLogout={handleLogout} />
    </div>
  );
}
