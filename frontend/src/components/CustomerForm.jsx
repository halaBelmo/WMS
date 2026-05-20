import styles from "./CustomerForm.module.css";

export default function CustomerForm({
  className = "",
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form className={`${styles.card} ${className}`.trim()} onSubmit={onSubmit}>
      <div className={styles.header}>
        <h3 className={styles.title}>Create Customer</h3>
        <p className={styles.subtitle}>Enter customer contact details and save.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            className={styles.largeInput}
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Customer name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Address</label>
          <textarea
            value={form.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="Full address"
            rows="2"
          />
        </div>

        <div className={styles.field}>
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="customer@example.com"
            required
          />
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Customer" : "Create Customer"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          Reset
        </button>
      </div>
    </form>
  );
}
