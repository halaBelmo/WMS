import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logoArea}>
      <div className={styles.logoBox}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
        </svg>
      </div>
      <div className={styles.logoTextWrap}>
        <span className={styles.logoText}>WMS</span>
        <span className={styles.logoTag}>Warehouse Management</span>
      </div>
    </div>
  );
}
