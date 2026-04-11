import styles from "./Navbar.module.css";

export default function Navbar({ activePage, onNavigate }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.logoBox}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className={styles.brandName}>WMS</span>
          <span className={styles.brandTag}>Warehouse</span>
        </div>

        {/* Nav links */}
        <ul className={styles.navLinks}>
          <li>
            <button
              className={`${styles.navLink} ${activePage === "about" ? styles.active : ""}`}
              onClick={() => onNavigate("about")}
            >
              À propos
            </button>
          </li>
          <li>
            <button
              className={`${styles.navLink} ${activePage === "features" ? styles.active : ""}`}
              onClick={() => onNavigate("features")}
            >
              Fonctionnalités
            </button>
          </li>
          <li>
            <button
              className={`${styles.navLink} ${activePage === "contact" ? styles.active : ""}`}
              onClick={() => onNavigate("contact")}
            >
              Contact
            </button>
          </li>
        </ul>

        {/* Auth buttons */}
        <div className={styles.authButtons}>
          <button
            className={`${styles.btnGhost} ${activePage === "login" ? styles.activeAuth : ""}`}
            onClick={() => onNavigate("login")}
          >
            Se connecter
          </button>
          <button
            className={`${styles.btnSolid} ${activePage === "signup" ? styles.activeAuth : ""}`}
            onClick={() => onNavigate("signup")}
          >
            Créer un compte
          </button>
        </div>
      </div>
    </nav>
  );
}
