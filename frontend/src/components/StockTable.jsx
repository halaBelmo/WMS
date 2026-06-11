import Button from "./Button";
import styles from "./StockTable.module.css";

function statusFromQuantity(quantity) {
  const value = Number(quantity || 0);
  if (value === 0) return { label: "Out of Stock", className: styles.out };
  if (value <= 100) return { label: "Low Stock", className: styles.low };
  return { label: "In Stock", className: styles.in };
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function StockTable({ stocks, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <div className={styles.card}>Loading stocks...</div>;
  }

  if (!stocks.length) {
    return <div className={styles.card}>No stocks found.</div>;
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const status = statusFromQuantity(stock.quantity);

            return (
              <tr key={stock.id}>
                <td>{stock.id}</td>
                <td>{stock.productName || "-"}</td>
                <td>{stock.locationLabel || stock.locationCode || stock.locationName || "-"}</td>
                <td>
                  <span className={styles.qtyBadge}>{stock.quantity}</span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${status.className}`}>{status.label}</span>
                </td>
                <td className={styles.actions}>
                  <Button variant="outline" fullWidth={false} onClick={() => onEdit(stock)}>
                    <EditIcon />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth={false}
                    disabled={deletingId === stock.id}
                    onClick={() => onDelete(stock)}
                  >
                    {deletingId === stock.id ? (
                      "Deleting..."
                    ) : (
                      <>
                        <DeleteIcon />
                        Delete
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
