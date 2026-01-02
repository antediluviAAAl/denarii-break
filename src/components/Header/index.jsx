/* src/components/Header/index.jsx */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  CheckCircle,
  PlusCircle,
  LogIn,
  LogOut,
  LineChart,
  Coins,
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
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      // If user scrolls down more than 10px, trigger the 'scrolled' state
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${styles.appHeader} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.headerContent}>
        {/* LEFT: Branding */}
        <div className={styles.headerLeft}>
          <div className={styles.appIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              width="100"
              height="100"
              alt="Logo"
              style={{ display: "block" }}
            />
          </div>

          <div className={styles.titleWrapper}>
            <h1 className={styles.appTitle}>
              <span className={styles.titleDenarii}>Denarii</span>
              <span className={styles.titleDistrict}> District</span>
            </h1>

            <div className={styles.appSubtitle}>
              <Database size={16} className="text-gold" />
              <span style={{ fontWeight: 600 }}>
                {totalCoins.toLocaleString()} coins in database
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
          {/* Silver Spot Button */}
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
              {/* Add Coin Button */}
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

              {/* Sign Out Button */}
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
            /* Sign In Button */
            <Link
              href="/login"
              className={styles.headerActionBtn}
              title="Sign In"
            >
              <LogIn size={20} className="text-gold" />
              <span className={styles.statValue}>Sign In</span>
            </Link>
          )}

          {/* Showing Count Badge */}
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Showing</span>
            <div className={styles.statValueRow}>
              <Coins size={20} className={styles.statIcon} />
              <span className={styles.statValue}>
                {(displayCount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}