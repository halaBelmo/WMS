import styles from "./CustomerTable.module.css";

export default function CustomerTable({
  customers,
  loading,
  deletingId,
  onEdit,
  onDelete,
  canManage,
}) {
  if (loading) {
    return <div className={styles.loading}>Loading customers...</div>;
  }

  if (customers.length === 0) {
    return <div className={styles.empty}>No customers found.</div>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            {canManage ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone || "-"}</td>
              <td>{customer.address || "-"}</td>
              {canManage ? (
                <td className={styles.actions}>
                  <button
                    onClick={() => onEdit(customer)}
                    className={styles.editBtn}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    disabled={deletingId === customer.id}
                    className={styles.deleteBtn}
                    title="Delete"
                  >
                    {deletingId === customer.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
