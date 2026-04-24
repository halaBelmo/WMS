import Button from "./Button";
import styles from "./StockTable.module.css";

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{stock.id}</td>
              <td>{stock.productName || "-"}</td>
              <td>{stock.locationName || "-"}</td>
              <td>{stock.quantity}</td>
              <td className={styles.actions}>
                <Button variant="outline" fullWidth={false} onClick={() => onEdit(stock)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  fullWidth={false}
                  disabled={deletingId === stock.id}
                  onClick={() => onDelete(stock)}
                >
                  {deletingId === stock.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

