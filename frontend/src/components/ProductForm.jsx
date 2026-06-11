import { useState, useEffect } from "react";
import styles from "./ProductForm.module.css";
import api from "../services/api";

export default function ProductForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
  onSuppliersLoaded,
}) {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await api.get("/api/owner/suppliers");
        const list = Array.isArray(response.data) ? response.data : [];
        setSuppliers(list);
        if (typeof onSuppliersLoaded === "function") {
          onSuppliersLoaded(list);
        }
      } catch (err) {
        console.error("Failed to load suppliers", err);
        if (typeof onSuppliersLoaded === "function") {
          onSuppliersLoaded([]);
        }
      }
    };
    loadSuppliers();
  }, [onSuppliersLoaded]);

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.header}>
        <h3 className={styles.title}>{isEditing ? "Update Product" : "Create Product"}</h3>
        <p className={styles.subtitle}>Create product records for warehouse catalog and stock workflows.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Product Name</label>
          <input
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Product name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Supplier</label>
          <select
            value={form.supplierId || ""}
            onChange={(e) => onChange("supplierId", e.target.value)}
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.field} ${styles.descriptionField}`}>
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Short product description"
            rows={3}
          />
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={onCancel}>
          Reset
        </button>
      </div>
    </form>
  );
}
