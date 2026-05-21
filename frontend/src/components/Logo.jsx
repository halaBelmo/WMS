import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logoArea}>
      <img src="/Logo.JPG" alt="WMS logo" className={styles.logoImage} />
    </div>
  );
}
