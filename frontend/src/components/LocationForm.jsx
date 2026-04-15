import Button from "./Button";
import styles from "./LocationForm.module.css";

export default function LocationForm({
  form,
  currentWarehouseId,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Location" : "Create Location"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Location name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Zone</label>
          <input
            value={form.zone}
            onChange={(event) => onChange("zone", event.target.value)}
            placeholder="Zone (e.g., A1)"
          />
        </div>

        <div className={styles.field}>
          <label>Rack</label>
          <input
            value={form.rack}
            onChange={(event) => onChange("rack", event.target.value)}
            placeholder="Rack number"
          />
        </div>

        <div className={styles.field}>
          <label>Etager</label>
          <input
            value={form.etager}
            onChange={(event) => onChange("etager", event.target.value)}
            placeholder="Shelf level"
          />
        </div>


      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Location" : "Create Location"}
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
