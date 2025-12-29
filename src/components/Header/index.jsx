"use client";

import React from "react";
import Link from "next/link";
import { Database, CheckCircle, PlusCircle, LogIn, LogOut } from "lucide-react";
import styles from "./Header.module.css";

export default function Header({
  ownedCount = 0,
  displayCount = 0,
  totalCoins = 264962,
  onAddCoin,
  session,
  onLogout,
}) {
  return (
    <header className={styles.appHeader}>
      <div className={styles.headerContent}>
        {/* LEFT: Branding */}
        <div className={styles.headerLeft}>
          <h1 className={styles.appTitle}>
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

        {/* RIGHT: Actions & Stats */}
        <div className={styles.headerStats}>
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
                  <span className={styles.statValue}>Add Coin</span>
                </button>
              )}

              {/* Sign Out Button */}
              <button
                onClick={onLogout}
                className={styles.headerActionBtn}
                title="Sign Out"
              >
                <LogOut size={20} className="text-gold" />
                <span className={styles.statValue}>Sign Out</span>
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

          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Showing</span>
            <span className={styles.statValue}>
              {(displayCount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}