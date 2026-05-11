import Button from "./Button";
import styles from "./SupplierForm.module.css";

export default function SupplierForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Supplier" : "Create Supplier"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Supplier name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="supplier@example.com"
            required
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
          <label>Contact</label>
          <input
            value={form.contact}
            onChange={(event) => onChange("contact", event.target.value)}
            placeholder="Contact person name"
          />
        </div>

        <div className={styles.field}>
          <label>Address</label>
          <textarea
            value={form.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="Full address"
            rows="3"
          />
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Supplier" : "Create Supplier"}
        </Button>
        {isEditing ? (
          <Button type="button" variant="outline" fullWidth={false} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

