import { useState, useEffect } from "react";
import Button from "./Button";
import styles from "./StockForm.module.css";
import api from "../services/api";

export default function StockForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
  locationId,
  locationName,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get("/api/owner/products");
        setProducts(response.data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>
        {isEditing ? "Update Stock" : "Create Stock"}
      </h3>

      {/* Selected Location Display */}
      <div className={styles.locationDisplay}>
        <span className={styles.locationLabel}>Selected Location:</span>
        <span className={styles.locationValue}>
          {locationName ? locationName : `ID: ${locationId}`}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Product</label>
          <select
            value={form.productId || ""}
            onChange={(e) => onChange("productId", e.target.value)}
            required
            disabled={isEditing || loading}
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Quantity</label>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Stock"
            : "Create Stock"}
        </Button>
        {isEditing ? (
          <Button
            type="button"
            variant="outline"
            fullWidth={false}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

