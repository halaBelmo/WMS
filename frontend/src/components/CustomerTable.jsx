import styles from "./CustomerTable.module.css";

function Icon({ type }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function initialsFromName(name) {
  const value = String(name || "").trim();
  if (!value) return "C";
  return value.charAt(0).toUpperCase();
}

export default function CustomerTable({
  customers,
  loading,
  deletingId,
  onEdit,
  onDelete,
  canManage,
}) {
  if (loading) {
    return <div className={styles.card}>Loading customers...</div>;
  }

  if (customers.length === 0) {
    return <div className={styles.card}>No customers found.</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Address</th>
              <th>Phone</th>
              {canManage ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className={styles.customerCell}>
                    <span className={styles.avatar}>{initialsFromName(customer.name)}</span>
                    <div className={styles.customerMeta}>
                      <strong>{customer.name}</strong>
                      <span className={styles.emailText}>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.addressCell}>{customer.address || "-"}</td>
                <td>{customer.phone || "-"}</td>
                {canManage ? (
                  <td className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => onEdit(customer)}
                      className={styles.actionBtn}
                      title="Edit customer"
                    >
                      <Icon type="edit" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(customer)}
                      disabled={deletingId === customer.id}
                      className={`${styles.actionBtn} ${styles.dangerBtn}`}
                      title="Delete customer"
                    >
                      <Icon type="delete" />
                      {deletingId === customer.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
