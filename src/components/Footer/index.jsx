/* src/components/Footer/index.jsx */
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer({ session, onLogout }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Section */}
        <Link href="/" className={styles.brandLink}>
          <div className={styles.brandGroup}>
            <span className={styles.denarii}>Denarii</span>
            <span className={styles.district}>District</span>
          </div>
        </Link>

        {/* Links Section */}
        <div className={styles.links}>
          <Link href="/" className={styles.link}>
            Hub
          </Link>

          <Link href="/gallery" className={styles.link}>
            Gallery
          </Link>

          {session ? (
            <button
              onClick={onLogout}
              className={styles.logoutBtn}
              title="Sign out of your account"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className={styles.link}>
              Login
            </Link>
          )}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={styles.link}
          >
            Back to Top
          </a>
        </div>

        {/* Copyright Section */}
        <div className={styles.copyright}>
          &copy; {currentYear} Denarii District. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
