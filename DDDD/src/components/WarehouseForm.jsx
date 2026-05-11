import Button from "./Button";
import styles from "./WarehouseForm.module.css";

export default function WarehouseForm({ form, onChange, onSubmit, loading, error }) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>Create warehouse</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Central Warehouse"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Location</label>
          <input
            value={form.location}
            onChange={(event) => onChange("location", event.target.value)}
            placeholder="Casablanca"
            required
          />
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <Button type="submit" fullWidth={false} disabled={loading}>
        {loading ? "Creating..." : "Create warehouse"}
      </Button>
    </form>
  );
}
