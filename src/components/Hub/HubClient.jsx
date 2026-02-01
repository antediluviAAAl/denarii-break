/* src/components/Hub/HubClient.jsx */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Header from "../Header";
import Footer from "../Footer";
import PreviewCard from "./PreviewCard";
import RegionView from "./RegionView";
import EraView from "./EraView";
import MarketModal from "../MarketModal"; // <--- UPDATED IMPORT
import AddCoinModal from "../AddCoinModal";
import { useCoins } from "../../hooks/useCoins";
import styles from "./Hub.module.css";

// --- LOCAL BACKGROUND IMAGES ---
const IMG_EXPLORE = "/images/explore.webp";
const IMG_REGIONS = "/images/regions.webp";
const IMG_ERAS = "/images/eras.webp";

export default function HubClient({ stats }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Global Actions State
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false); // <--- RENAMED STATE
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch metadata ONLY for the selection modals
  const { metadata, refetch, ownedIds } = useCoins({
    fetchCoins: false,
  });

  // Default stats to 0 if server fetch failed
  const safeStats = stats || {
    total_coins: 0,
    total_countries: 0,
    total_periods: 0,
    total_owned_coins: 0,
  };

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

  return (
    <div className={styles.hubContainer}>
      <Header
        totalCoins={safeStats.total_coins}
        ownedCount={safeStats.total_owned_coins}
        onOpenMarket={() => setIsMarketModalOpen(true)} // <--- UPDATED PROP
        onAddCoin={() => setIsAddModalOpen(true)}
        session={session}
        onLogout={handleLogout}
      />

      <main className={styles.hubContent}>
        {/* 1. EXPLORE */}
        <PreviewCard
          title="EXPLORE"
          subtitlePrefix="Browse the full"
          statNumber={safeStats.total_coins}
          subtitleSuffix="coins"
          variant="straight"
          bgImage={IMG_EXPLORE}
          onClick={() => router.push("/gallery")}
        />

        {/* 2. COUNTRIES */}
        <PreviewCard
          title="COUNTRIES"
          subtitlePrefix="Journey across"
          statNumber={safeStats.total_countries}
          subtitleSuffix="geopolitical entities"
          variant="left"
          bgImage={IMG_REGIONS}
          onClick={() => setModalType("countries")}
        />

        {/* 3. TIME PERIODS */}
        <PreviewCard
          title="TIME PERIODS"
          subtitlePrefix="Relive history through"
          statNumber={safeStats.total_periods}
          subtitleSuffix="periods"
          variant="right"
          bgImage={IMG_ERAS}
          onClick={() => setModalType("periods")}
        />
      </main>

      <Footer session={session} onLogout={handleLogout} />

      {/* MODALS */}
      {modalType === "countries" && (
        <RegionView data={metadata} onClose={() => setModalType(null)} />
      )}

      {modalType === "periods" && (
        <EraView data={metadata} onClose={() => setModalType(null)} />
      )}

      {/* UPDATED MODAL COMPONENT */}
      {isMarketModalOpen && (
        <MarketModal onClose={() => setIsMarketModalOpen(false)} />
      )}

      {isAddModalOpen && session && (
        <AddCoinModal
          onClose={() => setIsAddModalOpen(false)}
          onCoinAdded={refetch}
          userId={session.user.id}
          initialCoin={null}
          ownedIds={ownedIds}
        />
      )}
    </div>
  );
}