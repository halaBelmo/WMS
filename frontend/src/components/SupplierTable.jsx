import styles from "./SupplierTable.module.css";

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

  if (type === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }

  if (type === "filter") {
    return (
      <svg {...common}>
        <path d="M3 5h18" />
        <path d="M6 12h12" />
        <path d="M10 19h4" />
      </svg>
    );
  }

  if (type === "sort") {
    return (
      <svg {...common}>
        <path d="M11 5h10" />
        <path d="M11 12h7" />
        <path d="M11 19h4" />
        <path d="m4 18 3 3 3-3" />
        <path d="M7 21V3" />
      </svg>
    );
  }

  if (type === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  if (type === "delete") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export default function SupplierTable({
  suppliers,
  loading,
  deletingId,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  contactFilter,
  onContactFilterChange,
  sortOrder,
  onSortOrderChange,
  contactOptions,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Suppliers Directory</h3>
        <p className={styles.subtitle}>Review supplier records and manage communication details.</p>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span className={styles.fieldIcon}><Icon type="search" /></span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search supplier"
          />
        </label>

        <label className={styles.selectField}>
          <span className={styles.fieldIcon}><Icon type="filter" /></span>
          <select value={contactFilter} onChange={(event) => onContactFilterChange(event.target.value)}>
            <option value="">All contacts</option>
            {contactOptions.map((contact) => (
              <option key={contact} value={contact}>
                {contact}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.selectField}>
          <span className={styles.fieldIcon}><Icon type="sort" /></span>
          <select value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value)}>
            <option value="az">Sort: A-Z</option>
            <option value="za">Sort: Z-A</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.messageCell}>Loading suppliers...</td>
              </tr>
            ) : null}

            {!loading && !suppliers.length ? (
              <tr>
                <td colSpan={6} className={styles.messageCell}>No suppliers found for selected filters.</td>
              </tr>
            ) : null}

            {!loading
              ? suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className={styles.supplierCell}>
                      <span className={styles.avatar}>{String(supplier.name || "?").charAt(0).toUpperCase()}</span>
                      <div>
                        <p className={styles.supplierName}>{supplier.name || "-"}</p>
                        <p className={styles.supplierId}>SUP-{supplier.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.contactBadge}>{supplier.contact || "-"}</span>
                  </td>
                  <td className={styles.emailCell}>{supplier.email || "-"}</td>
                  <td className={styles.phoneCell}>{supplier.phone || "-"}</td>
                  <td>
                    <p className={styles.address} title={supplier.address || "-"}>{supplier.address || "-"}</p>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionBtn} onClick={() => onEdit(supplier)}>
                        <Icon type="edit" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => onDelete(supplier)}
                        disabled={deletingId === supplier.id}
                      >
                        <Icon type="delete" />
                        {deletingId === supplier.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

