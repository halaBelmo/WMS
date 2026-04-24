import { useState, useEffect } from "react";
import Button from "./Button";
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
}) {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await api.get("/api/owner/suppliers");
        setSuppliers(response.data || []);
      } catch (err) {
        console.error("Failed to load suppliers", err);
      }
    };
    loadSuppliers();
  }, []);

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Product" : "Create Product"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Product name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Product description"
            rows={3}
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
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
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
