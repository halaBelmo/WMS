import Button from "./Button";
import styles from "./UserForm.module.css";

export default function UserForm({
  form,
  roles,
  warehouses,
  showWarehouseSelect,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
  currentWarehouseName,
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update user" : "Create user"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="User full name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="user@company.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label>{isEditing ? "Password (optional)" : "Password"}</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="********"
            required={!isEditing}
          />
        </div>

        <div className={styles.field}>
          <label>Role</label>
          <select
            value={form.role}
            onChange={(event) => onChange("role", event.target.value)}
            required
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {showWarehouseSelect ? (
          <div className={styles.field}>
            <label>Warehouse</label>
            <select
              value={form.warehouseId}
              onChange={(event) => onChange("warehouseId", event.target.value)}
              required
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={styles.field}>
            <label>Warehouse</label>
            <input value={currentWarehouseName || "Current admin warehouse"} disabled />
          </div>
        )}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update user" : "Create user"}
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
