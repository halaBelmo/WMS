import Button from "./Button";
import styles from "./ShelfForm.module.css";

export default function ShelfForm({
  form,
  racks,
  selectedRack,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Shelf" : "Create Shelf"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Code</label>
          <input
            value={form.code}
            onChange={(event) => onChange("code", event.target.value)}
            placeholder="Shelf code"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Rack</label>
          <select
            value={form.rackId}
            onChange={(event) => onChange("rackId", event.target.value)}
            required
          >
            <option value="">Select Rack</option>
            {racks.map((rack) => (
              <option key={rack.id} value={rack.id}>{rack.code}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Shelf" : "Create Shelf"}
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
