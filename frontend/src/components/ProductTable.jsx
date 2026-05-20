import styles from "./ProductTable.module.css";

function formatMoney(value) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numeric);
}

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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export default function ProductTable({
  products,
  loading,
  deletingId,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  supplierFilter,
  onSupplierFilterChange,
  sortByPrice,
  onSortByPriceChange,
  supplierOptions,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Products Catalog</h3>
        <p className={styles.subtitle}>Monitor and maintain your active warehouse product list.</p>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span className={styles.fieldIcon}><Icon type="search" /></span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search product"
          />
        </label>

        <label className={styles.selectField}>
          <span className={styles.fieldIcon}><Icon type="filter" /></span>
          <select value={supplierFilter} onChange={(event) => onSupplierFilterChange(event.target.value)}>
            <option value="">All suppliers</option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.selectField}>
          <span className={styles.fieldIcon}><Icon type="sort" /></span>
          <select value={sortByPrice} onChange={(event) => onSortByPriceChange(event.target.value)}>
            <option value="default">Sort by price</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Supplier</th>
              <th>Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.messageCell}>Loading products...</td>
              </tr>
            ) : null}

            {!loading && !products.length ? (
              <tr>
                <td colSpan={5} className={styles.messageCell}>No products found for selected filters.</td>
              </tr>
            ) : null}

            {!loading
              ? products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.avatar}>{String(product.name || "?").charAt(0).toUpperCase()}</span>
                      <div>
                        <p className={styles.productName}>{product.name || "-"}</p>
                        <p className={styles.productId}>PRD-{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.supplierBadge}>{product.supplierName || "No supplier"}</span>
                  </td>
                  <td>
                    <span className={styles.priceBadge}>{formatMoney(product.price)}</span>
                  </td>
                  <td>
                    <p className={styles.description} title={product.description || "-"}>
                      {product.description || "-"}
                    </p>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionBtn} onClick={() => onEdit(product)}>
                        <Icon type="edit" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        disabled={deletingId === product.id}
                        onClick={() => onDelete(product)}
                      >
                        <Icon type="delete" />
                        {deletingId === product.id ? "Deleting..." : "Delete"}
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

