import React from "react";
import Link from "next/link";
import CoinDetailView from "../../../components/CoinDetailView"; // Fixed relative import
// Note: We don't import Header here to keep the focus on the coin,
// but if you need it, import it as: import Header from "../../../components/Header";

export default function CoinPage({ params }) {
  const { id } = params;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Breadcrumb / Back Link */}
        <div style={{ marginBottom: "1rem" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            ← Back to Gallery
          </Link>
        </div>

        {/* The Detail Card */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-xl)",
            overflow: "hidden",
          }}
        >
          <CoinDetailView coinId={id} showCloseBtn={false} />
        </div>
      </div>
    </main>
  );
}
