/* src/components/Footer/index.jsx */
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
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
            Home
          </Link>
          <Link href="/login" className={styles.link}>
            Login
          </Link>
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
