import Button from "./Button";
import styles from "./ProductTable.module.css";

export default function ProductTable({ products, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <div className={styles.card}>Loading products...</div>;
  }

  if (!products.length) {
    return <div className={styles.card}>No products found.</div>;
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              
              <td>{product.name}</td>
              <td>{product.description || "-"}</td>
              <td>{product.price ?? "-"}</td>
              <td>{product.supplierName || "-"}</td>
              <td className={styles.actions}>
                <Button variant="outline" fullWidth={false} onClick={() => onEdit(product)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  fullWidth={false}
                  disabled={deletingId === product.id}
                  onClick={() => onDelete(product)}
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

