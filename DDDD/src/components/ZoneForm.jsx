import Button from "./Button";
import styles from "./ZoneForm.module.css";

export default function ZoneForm({
  form,
  warehouses,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Zone" : "Create Zone"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Zone name"
            required
          />
        </div>


      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Zone" : "Create Zone"}
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

