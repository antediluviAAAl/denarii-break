/* src/app/page.js */
import { Suspense } from "react";
import { getDenariiStats } from "../lib/coinService";
import HubClient from "../components/Hub/HubClient";

// 1. This is now a SERVER Component (no 'use client' at top)
// 2. We fetch the stats here, once, on the server.
// 3. We pass the data to HubClient, which handles the interactivity.

export const revalidate = 60; // Optional: Revalidate this data every 60 seconds

export default async function HubPage() {
  // Fetch stats from DB (ID=1)
  const stats = await getDenariiStats();

  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", backgroundColor: "#fff" }} />}
    >
      <HubClient stats={stats} />
    </Suspense>
  );
}