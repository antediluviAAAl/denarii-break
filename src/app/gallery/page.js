/* src/app/gallery/page.js */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Header from "../../components/Header";
import FilterBar from "../../components/FilterBar";
import CoinGallery from "../../components/CoinGallery";
import AddCoinModal from "../../components/AddCoinModal";
import MarketModal from "../../components/MarketModal"; // <--- FIXED IMPORT
import Footer from "../../components/Footer";
import { useCoins } from "../../hooks/useCoins";

function GalleryContent() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // RENAMED STATE: Tracks the unified Market/Metal modal
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false); 
  const [viewMode, setViewMode] = useState("grid");

  // Fetch coins: TRUE (We want data here)
  const {
    coins,
    loading,
    filters,
    setFilters,
    metadata,
    totalCoins,
    ownedCount,
    ownedIds,
    refetch,
    isExploreMode,
  } = useCoins({ fetchCoins: true });

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

  // Handler for clicking a coin in any view (Grid/List/Table)
  const handleCoinClick = (coinId) => {
    router.push(`/coin/${coinId}`);
  };

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
        // UPDATED PROP: Matches the new Header API
        onOpenMarket={() => setIsMarketModalOpen(true)}
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

        <div style={{ padding: "0 1rem" }}>
          <CoinGallery
            coins={coins}
            loading={loading}
            categories={metadata.categories}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={filters.sortBy}
            onCoinClick={handleCoinClick}
          />
        </div>

        {isAddModalOpen && session && (
          <AddCoinModal
            onClose={() => setIsAddModalOpen(false)}
            onCoinAdded={refetch}
            userId={session.user.id}
            initialCoin={null}
            ownedIds={ownedIds}
          />
        )}

        {/* REPLACED COMPONENT: The new Metal Spot Modal */}
        {isMarketModalOpen && (
          <MarketModal onClose={() => setIsMarketModalOpen(false)} />
        )}
      </main>

      <Footer session={session} onLogout={handleLogout} />
    </div>
  );
}

// The Main Page Component wraps the content in Suspense
export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Loading Gallery...
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}