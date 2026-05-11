import Button from "./Button";
import styles from "./LocationForm.module.css";

export default function LocationForm({
  form,
  shelves,
  selectedShelf,
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
          <label>Shelf</label>
          <select
            value={form.shelfId || ""}
            onChange={(event) => onChange("shelfId", event.target.value)}
            required
          >
            <option value="">Select Shelf</option>
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.code}
              </option>
            ))}
          </select>
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
