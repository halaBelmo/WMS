import styles from "./Navbar.module.css";

export default function Navbar({ activePage, onNavigate }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.brand}>
          <img src="/Logo.JPG" alt="WMS logo" className={styles.logoImage} />
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
