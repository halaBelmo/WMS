import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  fullWidth = true,
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${styles[variant]} ${fullWidth ? styles.fullWidth : ""} ${disabled ? styles.disabled : ""}`}
    >
      {children}
    </button>
  );
}
