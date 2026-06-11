import { useState, useEffect } from "react";
import Button from "./Button";
import styles from "./StockForm.module.css";
import api from "../services/api";

export default function StockForm({
  className = "",
  title,
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  disableSubmit = false,
  error,
  locationId,
  locationName,
  locationPreview,
  locationReady = true,
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

  const heading = title || (isEditing ? "Update Stock" : "Create Stock");
  const resolvedLocationPreview =
    locationPreview || locationName || (locationId ? `ID: ${locationId}` : "Select location");

  return (
    <form className={`${styles.form} ${className}`.trim()} onSubmit={onSubmit}>
      <h3 className={styles.title}>{heading}</h3>

      <div className={styles.locationPreview}>
        <span className={styles.previewLabel}>Selected Location</span>
        <span className={styles.previewValue}>{resolvedLocationPreview}</span>
      </div>

      {!locationReady ? (
        <p className={styles.notice}>Choose all hierarchy levels before creating stock.</p>
      ) : null}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Product</label>
          <select
            value={form.productId || ""}
            onChange={(e) => onChange("productId", e.target.value)}
            required
            disabled={isEditing || loading || !locationReady}
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code || product.productCode || product.name || `#${product.id}`}
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
        <Button type="submit" fullWidth={false} disabled={isSubmitting || disableSubmit}>
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

