import Button from "./Button";
import styles from "./RackForm.module.css";

export default function RackForm({
  form,
  zones,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Rack" : "Create Rack"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Code</label>
          <input
            value={form.code}
            onChange={(event) => onChange("code", event.target.value)}
            placeholder="Rack code"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Zone</label>
          <select
            value={form.zoneId}
            onChange={(event) => onChange("zoneId", event.target.value)}
            required
          >
            <option value="">Select Zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Rack" : "Create Rack"}
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
