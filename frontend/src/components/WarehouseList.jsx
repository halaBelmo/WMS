import Button from "./Button";
import styles from "./WarehouseList.module.css";

export default function WarehouseList({ warehouses, loading, deletingId, onDelete }) {
  if (loading) {
    return <div className={styles.card}>Loading warehouses...</div>;
  }

  if (!warehouses.length) {
    return <div className={styles.card}>No warehouses found.</div>;
  }

  return (
    <div className={styles.grid}>
      {warehouses.map((warehouse) => (
        <article key={warehouse.id} className={styles.card}>
          <h4>{warehouse.code || warehouse.name || `#${warehouse.id}`}</h4>
          <p>{warehouse.location || "No location provided"}</p>

          <div className={styles.actions}>
            <Button
              variant="outline"
              fullWidth={false}
              disabled={deletingId === warehouse.id}
              onClick={() => onDelete(warehouse)}
            >
              {deletingId === warehouse.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
