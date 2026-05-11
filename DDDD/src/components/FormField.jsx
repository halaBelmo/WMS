import styles from "./FormField.module.css";

export default function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  required = false,
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          className={`${styles.input} ${icon ? styles.withIcon : ""}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
}
