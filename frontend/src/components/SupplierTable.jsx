import styles from "./SupplierTable.module.css";

export default function SupplierTable({ suppliers, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <div className={styles.loading}>Loading suppliers...</div>;
  }

  if (suppliers.length === 0) {
    return <div className={styles.empty}>No suppliers found.</div>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
             
              <td>{supplier.name}</td>
              <td>{supplier.email}</td>
              <td>{supplier.phone || "-"}</td>
              <td>{supplier.contact || "-"}</td>
              <td className={styles.actions}>
                <button 
                  onClick={() => onEdit(supplier)} 
                  className={styles.editBtn}
                  title="Edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(supplier)} 
                  disabled={deletingId === supplier.id}
                  className={styles.deleteBtn}
                  title="Delete"
                >
                  {deletingId === supplier.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

