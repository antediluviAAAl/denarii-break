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
import ThemeToggle from "../ThemeToggle";
import styles from "./Header.module.css";
import { formatStatNumber } from "../../utils/dataUtils";

export default function Header({
  ownedCount = 0,
  displayCount = 0,
  totalCoins = 264962,
  onAddCoin,
  onOpenMarket, // <--- UPDATED PROP NAME
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
                <span className={styles.goldNumber}>
                  {formatStatNumber(totalCoins)}
                </span>
                {" coins"}
              </span>

              {ownedCount > 0 && (
                <>
                  <span className={styles.separator}>•</span>
                  <CheckCircle size={16} className={styles.iconGreen} />
                  <span style={{ fontWeight: 600 }}>
                    <span className={styles.greenNumber}>
                      {formatStatNumber(ownedCount)}
                    </span>
                    {" owned"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions & Stats */}
        <div className={styles.headerStats}>
          
          {/* 1. Gallery Link */}
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

          {/* 2. Market Spot (UPDATED) */}
          <button
            onClick={onOpenMarket}
            className={`${styles.headerActionBtn} ${styles.silverBtn}`}
            title="View Market Prices"
          >
            <LineChart size={20} style={{ color: "#3b82f6" }} />
            <span className={styles.statValue}>
              <span className={styles.desktopText}>Market Spot</span>
              <span className={styles.mobileText}>Spot</span>
            </span>
          </button>

          {/* 3. Auth Actions */}
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

          {/* 4. Count Badge */}
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

          {/* 5. Theme Toggle */}
          <ThemeToggle className={styles.themeToggleBtn} />
          
        </div>
      </div>
    </header>
  );
}