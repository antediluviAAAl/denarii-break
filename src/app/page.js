/* src/app/page.js */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PreviewCard from "../components/Hub/PreviewCard";
import RegionView from "../components/Hub/RegionView"; // NEW IMPORT
import EraView from "../components/Hub/EraView"; // NEW IMPORT
import SilverChartModal from "../components/SilverChartModal";
import AddCoinModal from "../components/AddCoinModal";
import { useCoins } from "../hooks/useCoins";
import styles from "../components/Hub/Hub.module.css";

// --- LOCAL BACKGROUND IMAGES ---
const IMG_EXPLORE = "/images/explore.webp";
const IMG_REGIONS = "/images/regions.webp";
const IMG_ERAS = "/images/eras.webp";

function HubContent() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [modalType, setModalType] = useState(null); // 'countries' | 'periods' | null

  // Global Actions State
  const [isSilverModalOpen, setIsSilverModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch metadata ONLY
  const { metadata, totalCoins, refetch, ownedIds } = useCoins({
    fetchCoins: false,
  });

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
        totalCoins={totalCoins}
        onOpenSilver={() => setIsSilverModalOpen(true)}
        onAddCoin={() => setIsAddModalOpen(true)}
        session={session}
        onLogout={handleLogout}
      />

      <main className={styles.hubContent}>
        {/* 1. EXPLORE */}
        <PreviewCard
          title="EXPLORE"
          subtitle="Full Collection & Search"
          variant="straight"
          bgImage={IMG_EXPLORE}
          onClick={() => router.push("/gallery")}
        />

        {/* 2. REGIONS */}
        <PreviewCard
          title="REGIONS"
          subtitle="Kingdoms · Empires · States"
          variant="left"
          bgImage={IMG_REGIONS}
          onClick={() => setModalType("countries")}
        />

        {/* 3. ERAS */}
        <PreviewCard
          title="ERAS"
          subtitle="Timelines of History"
          variant="right"
          bgImage={IMG_ERAS}
          onClick={() => setModalType("periods")}
        />
      </main>

      <Footer session={session} onLogout={handleLogout} />

      {/* MODALS */}
      {/* Conditionally Render the Specific View */}
      {modalType === "countries" && (
        <RegionView data={metadata} onClose={() => setModalType(null)} />
      )}

      {modalType === "periods" && (
        <EraView data={metadata} onClose={() => setModalType(null)} />
      )}

      {isSilverModalOpen && (
        <SilverChartModal onClose={() => setIsSilverModalOpen(false)} />
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

export default function HubPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", backgroundColor: "#fff" }} />}
    >
      <HubContent />
    </Suspense>
  );
}
