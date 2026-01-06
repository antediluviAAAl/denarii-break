/* src/components/Header/index.jsx */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  CheckCircle,
  PlusCircle,
  LogIn,
  LogOut,
  LineChart,
  Coins,
  LayoutGrid,
} from "lucide-react";
import styles from "./Header.module.css";

export default function Header({
  ownedCount = 0,
  displayCount = 0,
  totalCoins = 264962,
  onAddCoin,
  onOpenSilver,
  session,
  onLogout,
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isGalleryPage = pathname === "/gallery";

  return (
    <header
      className={`${styles.appHeader} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.headerContent}>
        {/* LEFT: Branding */}
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.appIcon} title="Return to Hub">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              width="80"
              height="80"
              alt="Logo"
              style={{ display: "block" }}
            />
          </Link>

          <div className={styles.titleWrapper}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <h1 className={styles.appTitle}>
                <span className={styles.titleDenarii}>Denarii</span>
                <span className={styles.titleDistrict}> District</span>
              </h1>
            </Link>

            <div className={styles.appSubtitle}>
              <Database size={16} className="text-gold" />
              <span style={{ fontWeight: 600 }}>
                {totalCoins.toLocaleString()} coins
              </span>
              {ownedCount > 0 && (
                <span className={styles.ownedCount}>
                  <CheckCircle size={14} />
                  {ownedCount} owned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions & Stats */}
        <div className={styles.headerStats}>
          {/* Gallery Link (Hidden on Gallery Page) */}
          {!isGalleryPage && (
            <Link
              href="/gallery"
              className={styles.headerActionBtn}
              title="Open Gallery App"
            >
              <LayoutGrid size={20} className="text-gold" />
              <span className={styles.statValue}>
                <span className={styles.desktopText}>Gallery</span>
                <span className={styles.mobileText}>Gallery</span>
              </span>
            </Link>
          )}

          {/* Silver Spot */}
          <button
            onClick={onOpenSilver}
            className={`${styles.headerActionBtn} ${styles.silverBtn}`}
            title="View Silver Price"
          >
            <LineChart size={20} style={{ color: "#3b82f6" }} />
            <span className={styles.statValue}>
              <span className={styles.desktopText}>Silver Spot</span>
              <span className={styles.mobileText}>Silver</span>
            </span>
          </button>

          {session ? (
            <>
              {onAddCoin && (
                <button
                  onClick={onAddCoin}
                  className={styles.headerActionBtn}
                  title="Add a new coin"
                >
                  <PlusCircle size={20} className="text-gold" />
                  <span className={styles.statValue}>
                    <span className={styles.desktopText}>Add Coin</span>
                    <span className={styles.mobileText}>Add</span>
                  </span>
                </button>
              )}

              <button
                onClick={onLogout}
                className={styles.headerActionBtn}
                title="Sign Out"
              >
                <LogOut size={20} className="text-gold" />
                <span className={styles.statValue}>
                  <span className={styles.desktopText}>Sign Out</span>
                  <span className={styles.mobileText}>Out</span>
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={styles.headerActionBtn}
              title="Sign In"
            >
              <LogIn size={20} className="text-gold" />
              <span className={styles.statValue}>Sign In</span>
            </Link>
          )}

          {/* Showing Count Badge (Only visible when displayCount > 0) */}
          {displayCount > 0 && (
            <div className={styles.statBadge}>
              <span className={styles.statLabel}>Showing</span>
              <div className={styles.statValueRow}>
                <Coins size={20} className={styles.statIcon} />
                <span className={styles.statValue}>
                  {displayCount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
