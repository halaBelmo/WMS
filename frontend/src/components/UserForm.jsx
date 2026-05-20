import { useState } from "react";
import Button from "./Button";
import styles from "./UserForm.module.css";

function FieldIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" };

  switch (type) {
    case "name":
      return <svg {...common}><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "email":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case "password":
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    case "role":
      return <svg {...common}><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.3-5.5-3-5.5 3 1-6.3L3 9.9 9 9z" /></svg>;
    default:
      return <svg {...common}><path d="M3 10 12 4l9 6" /><path d="M4 10v10h16V10" /></svg>;
  }
}

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{isEditing ? "Update User" : "Create User"}</h3>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Full Name</label>
          <div className={styles.inputWrap}>
            <span className={styles.icon}><FieldIcon type="name" /></span>
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="User full name"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <div className={styles.inputWrap}>
            <span className={styles.icon}><FieldIcon type="email" /></span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="user@company.com"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>{isEditing ? "Password (optional)" : "Password"}</label>
          <div className={styles.inputWrap}>
            <span className={styles.icon}><FieldIcon type="password" /></span>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="********"
              required={!isEditing}
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label>Role</label>
          <div className={styles.inputWrap}>
            <span className={styles.icon}><FieldIcon type="role" /></span>
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
        </div>

        {showWarehouseSelect ? (
          <div className={styles.field}>
            <label>Warehouse</label>
            <div className={styles.inputWrap}>
              <span className={styles.icon}><FieldIcon type="warehouse" /></span>
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
          </div>
        ) : (
          <div className={styles.field}>
            <label>Warehouse</label>
            <div className={styles.inputWrap}>
              <span className={styles.icon}><FieldIcon type="warehouse" /></span>
              <input value={currentWarehouseName || "Current admin warehouse"} disabled />
            </div>
          </div>
        )}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
        </Button>
        <Button type="button" variant="outline" fullWidth={false} onClick={onCancel}>
          Reset
        </Button>
      </div>
    </form>
  );
}
