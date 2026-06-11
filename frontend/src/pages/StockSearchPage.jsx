import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import styles from "./StockSearchPage.module.css";

const initialFilters = {
  productName: "",
  supplierId: "",
  zoneId: "",
  rackId: "",
  shelfId: "",
};

function mapOptions(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.content)
        ? data.content
        : [];

  return list.map((item) => ({
    id: item.id ?? item.warehouseId ?? item.supplierId,
    name:
      item.name ||
      item.warehouseName ||
      item.supplierName ||
      item.code ||
      item.level ||
      `#${item.id ?? item.warehouseId ?? item.supplierId}`,
    code: item.code || item.productCode || item.supplierCode || item.warehouseCode || "",
  }));
}

async function fetchFirstSuccessful(paths) {
  for (const path of paths) {
    try {
      const response = await api.get(path);
      return response.data;
    } catch (error) {
      // Try next candidate path
    }
  }
  throw new Error("All candidate endpoints failed");
}

function mapStocks(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id ?? `${item.productId ?? "p"}-${item.locationId ?? "l"}`,
    productId: item.productId,
    productName: item.productName || item.product?.name || "-",
    sku: item.productCode || item.sku || item.product?.code || item.code || "",
    supplierName: item.supplierName || item.supplier?.name || "",
    supplierCode: item.supplierCode || item.supplier?.code || "",
    warehouseName: item.warehouseName || item.warehouseCode || "",
    warehouseId: item.warehouseId ?? "",
    locationId: item.locationId,
    locationCode: item.locationCode || item.location?.code || "",
    locationName: item.locationName || item.location?.name || "-",
    locationLabel:
      item.locationCode || item.location?.code || item.locationName || item.location?.name || "-",
    quantity: Number(item.quantity ?? 0),
    lastMovement:
      item.lastMovement ||
      item.lastMovementDate ||
      item.updatedAt ||
      item.modifiedAt ||
      item.createdAt ||
      null,
  }));
}

function statusFromQuantity(quantity) {
  const value = Number(quantity || 0);
  if (value <= 0) return { label: "Out of Stock", tone: "out" };
  if (value <= 25) return { label: "Low Stock", tone: "low" };
  return { label: "In Stock", tone: "in" };
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, "\"\"")}"`;
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

  if (type === "warehouse") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" />
        <path d="M9 21V12h6v9" />
      </svg>
    );
  }

  if (type === "export") {
    return (
      <svg {...common}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 21h16" />
      </svg>
    );
  }

  if (type === "clear") {
    return (
      <svg {...common}>
        <path d="m18 6-12 12M6 6l12 12" />
      </svg>
    );
  }

  if (type === "inventory") {
    return (
      <svg {...common}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  if (type === "box") {
    return (
      <svg {...common}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function SummaryItem({ children }) {
  return <span className={styles.summaryItem}>{children}</span>;
}

export default function StockSearchPage({ embedded = false, onResultsChange }) {
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [warehouseIdFromUser, setWarehouseIdFromUser] = useState(undefined);
  const [warehouseBadge, setWarehouseBadge] = useState("Warehouse");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilters(true);
      setError("");

      try {
        const [productsData, suppliersData, zonesData] = await Promise.all([
          fetchFirstSuccessful(["/api/owner/products"]),
          fetchFirstSuccessful(["/api/owner/suppliers"]),
          fetchFirstSuccessful(["/api/zones"]),
        ]);

        setProducts(mapOptions(productsData));
        setSuppliers(mapOptions(suppliersData));
        setZones(mapOptions(zonesData));
      } catch (requestError) {
        setError("Could not load base filters.");
      }

      setLoadingFilters(false);
    };

    loadFilters();
  }, []);

  useEffect(() => {
    try {
      const rawAuthUser = localStorage.getItem("auth_user");
      const authUser = rawAuthUser ? JSON.parse(rawAuthUser) : null;
      setWarehouseIdFromUser(authUser?.warehouseId ? Number(authUser.warehouseId) : undefined);
      setWarehouseBadge(
        authUser?.warehouseCode ||
        authUser?.warehouseName ||
        (authUser?.warehouseId ? `WH-${authUser.warehouseId}` : "Warehouse")
      );
    } catch (parseError) {
      setWarehouseIdFromUser(undefined);
      setWarehouseBadge("Warehouse");
    }
  }, []);

  useEffect(() => {
    const loadRacks = async () => {
      if (!filters.zoneId) {
        setRacks([]);
        setShelves([]);
        if (filters.rackId || filters.shelfId) {
          setFilters((prev) => ({ ...prev, rackId: "", shelfId: "" }));
        }
        return;
      }

      try {
        const response = await api.get(`/api/racks?zoneId=${filters.zoneId}`);
        setRacks(mapOptions(response.data));
      } catch (requestError) {
        setRacks([]);
        setError(requestError.response?.data?.message || "Could not load racks for selected zone.");
      }
    };

    loadRacks();
  }, [filters.zoneId]);

  useEffect(() => {
    const loadShelves = async () => {
      if (!filters.rackId) {
        setShelves([]);
        if (filters.shelfId) {
          setFilters((prev) => ({ ...prev, shelfId: "" }));
        }
        return;
      }

      try {
        const response = await api.get(`/api/shelves?rackId=${filters.rackId}`);
        setShelves(mapOptions(response.data));
      } catch (requestError) {
        setShelves([]);
        setError(requestError.response?.data?.message || "Could not load shelves for selected rack.");
      }
    };

    loadShelves();
  }, [filters.rackId]);

  const productSuggestions = useMemo(
    () => products.map((item) => item.name).filter(Boolean),
    [products]
  );

  const productById = useMemo(
    () => new Map(products.map((item) => [String(item.id), item])),
    [products]
  );

  const supplierById = useMemo(
    () => new Map(suppliers.map((item) => [String(item.id), item])),
    [suppliers]
  );
  const zoneById = useMemo(
    () => new Map(zones.map((item) => [String(item.id), item])),
    [zones]
  );
  const rackById = useMemo(
    () => new Map(racks.map((item) => [String(item.id), item])),
    [racks]
  );
  const shelfById = useMemo(
    () => new Map(shelves.map((item) => [String(item.id), item])),
    [shelves]
  );

  const selectedSupplierName = useMemo(
    () => supplierById.get(String(filters.supplierId || ""))?.name || "",
    [filters.supplierId, supplierById]
  );

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const searchParams = useMemo(
    () => ({
      productName: filters.productName.trim() || undefined,
      supplierId: filters.supplierId ? Number(filters.supplierId) : undefined,
      warehouseId: warehouseIdFromUser,
      zoneId: filters.zoneId ? Number(filters.zoneId) : undefined,
      rackId: filters.rackId ? Number(filters.rackId) : undefined,
      shelfId: filters.shelfId ? Number(filters.shelfId) : undefined,
    }),
    [filters, warehouseIdFromUser]
  );

  const handleSearch = async () => {
    setSearching(true);
    setError("");
    setHasSearched(true);
    setPage(1);

    try {
      const response = await api.get("/api/stocks/search", { params: searchParams });
      const mapped = mapStocks(response.data);
      setResults(mapped);
      onResultsChange?.(mapped);
    } catch (requestError) {
      setResults([]);
      onResultsChange?.([]);
      setError(requestError.response?.data?.message || "Could not search stocks.");
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setRacks([]);
    setShelves([]);
    setResults([]);
    setHasSearched(false);
    setError("");
    setPage(1);
    onResultsChange?.(null);
  };

  const handleExport = () => {
    if (!results.length) return;

    const headers = ["Product", "SKU", "Supplier", "Location", "Quantity", "Last Movement", "Status"];
    const lines = results.map((item) => {
      const productMeta = productById.get(String(item.productId || ""));
      const status = statusFromQuantity(item.quantity).label;
      const sku = item.sku || productMeta?.code || "-";
      const supplier = item.supplierName || selectedSupplierName || "-";

      return [
        csvEscape(item.productName),
        csvEscape(sku),
        csvEscape(supplier),
        csvEscape(item.locationLabel || item.locationCode || item.locationName),
        csvEscape(item.quantity),
        csvEscape(formatDateTime(item.lastMovement)),
        csvEscape(status),
      ].join(",");
    });

    const content = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    anchor.href = url;
    anchor.download = `inventory-browser-${stamp}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    const inStock = results.filter((item) => statusFromQuantity(item.quantity).tone === "in").length;
    const lowStock = results.filter((item) => statusFromQuantity(item.quantity).tone === "low").length;
    const outOfStock = results.filter((item) => statusFromQuantity(item.quantity).tone === "out").length;

    return {
      rows: results.length,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [results]);

  const selectedFilters = useMemo(() => {
    const entries = [];
    const productValue = filters.productName.trim();
    if (productValue) entries.push({ label: "Product", value: productValue });

    if (filters.supplierId) {
      entries.push({
        label: "Supplier",
        value: supplierById.get(String(filters.supplierId))?.name || `#${filters.supplierId}`,
      });
    }

    if (filters.zoneId) {
      entries.push({
        label: "Zone",
        value: zoneById.get(String(filters.zoneId))?.name || `#${filters.zoneId}`,
      });
    }

    if (filters.rackId) {
      entries.push({
        label: "Rack",
        value: rackById.get(String(filters.rackId))?.name || `#${filters.rackId}`,
      });
    }

    if (filters.shelfId) {
      entries.push({
        label: "Shelf",
        value: shelfById.get(String(filters.shelfId))?.name || `#${filters.shelfId}`,
      });
    }

    return entries;
  }, [filters, supplierById, zoneById, rackById, shelfById]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(results.length / pageSize)),
    [results.length, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  const pageStart = results.length ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, results.length);

  return (
    <section className={`${styles.page} ${embedded ? styles.embedded : ""}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.breadcrumb}>Dashboard / Stocks</p>
          <h1 className={styles.title}>Inventory Browser</h1>
          <p className={styles.subtitle}>Search and monitor warehouse inventory.</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badge}>
            <Icon type="warehouse" />
            {warehouseBadge}
          </span>
          <span className={styles.badgeCount}>
            <Icon type="inventory" />
            {results.length} inventory rows
          </span>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExport}
            disabled={!results.length || searching}
          >
            <Icon type="export" />
            Export
          </button>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.filterCard}>
            {loadingFilters ? <p className={styles.info}>Loading filters...</p> : null}

            {!loadingFilters ? (
              <div className={styles.toolbar}>
                <div className={`${styles.filterItem} ${styles.productField}`}>
                  <label className={styles.srOnly} htmlFor="inventory-product-search">Search product</label>
                  <input
                    id="inventory-product-search"
                    type="text"
                    list="product-name-options"
                    value={filters.productName}
                    placeholder="Search product"
                    onChange={(event) => updateFilter("productName", event.target.value)}
                  />
                  <datalist id="product-name-options">
                    {productSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                <div className={styles.filterItem}>
                  <label className={styles.srOnly} htmlFor="inventory-supplier-filter">Supplier</label>
                  <select
                    id="inventory-supplier-filter"
                    value={filters.supplierId}
                    onChange={(event) => updateFilter("supplierId", event.target.value)}
                  >
                    <option value="">Supplier</option>
                    {suppliers.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterItem}>
                  <label className={styles.srOnly} htmlFor="inventory-zone-filter">Zone</label>
                  <select
                    id="inventory-zone-filter"
                    value={filters.zoneId}
                    onChange={(event) => {
                      setFilters((prev) => ({
                        ...prev,
                        zoneId: event.target.value,
                        rackId: "",
                        shelfId: "",
                      }));
                    }}
                  >
                    <option value="">Zone</option>
                    {zones.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterItem}>
                  <label className={styles.srOnly} htmlFor="inventory-rack-filter">Rack</label>
                  <select
                    id="inventory-rack-filter"
                    value={filters.rackId}
                    onChange={(event) => {
                      setFilters((prev) => ({
                        ...prev,
                        rackId: event.target.value,
                        shelfId: "",
                      }));
                    }}
                    disabled={!filters.zoneId}
                  >
                    <option value="">{filters.zoneId ? "Rack" : "Rack (Zone first)"}</option>
                    {racks.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterItem}>
                  <label className={styles.srOnly} htmlFor="inventory-shelf-filter">Shelf</label>
                  <select
                    id="inventory-shelf-filter"
                    value={filters.shelfId}
                    onChange={(event) => updateFilter("shelfId", event.target.value)}
                    disabled={!filters.rackId}
                  >
                    <option value="">{filters.rackId ? "Shelf" : "Shelf (Rack first)"}</option>
                    {shelves.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.searchButton}
                  onClick={handleSearch}
                  disabled={searching}
                >
                  {searching ? "Searching..." : "Search"}
                </button>

                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClear}
                  disabled={searching}
                  aria-label="Clear filters"
                  title="Clear filters"
                >
                  <Icon type="clear" />
                </button>
              </div>
            ) : null}
          </section>

          {error ? <p className={styles.error}>{error}</p> : null}

          <section className={styles.tableCard}>
            <div className={styles.summaryBar}>
              <SummaryItem>{summary.rows} Rows</SummaryItem>
              <SummaryItem>{summary.inStock} In Stock</SummaryItem>
              <SummaryItem>{summary.lowStock} Low Stock</SummaryItem>
              <SummaryItem>{summary.outOfStock} Out of Stock</SummaryItem>
            </div>

            <div className={styles.tableWrap}>
              {searching ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}><Icon type="inventory" /></span>
                  <p className={styles.emptyTitle}>Searching inventory...</p>
                </div>
              ) : null}

              {!searching && !paginatedResults.length ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}><Icon type="box" /></span>
                  <p className={styles.emptyTitle}>No inventory rows to display</p>
                  <p className={styles.emptyText}>
                    {hasSearched
                      ? "No inventory matches the selected filters."
                      : "Use the filters above and click Search to load inventory rows."}
                  </p>
                </div>
              ) : null}

              {!searching && paginatedResults.length ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Supplier</th>
                      <th>Location</th>
                      <th>Quantity</th>
                      <th>Last Movement</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResults.map((item) => {
                      const productMeta = productById.get(String(item.productId || ""));
                      const sku = item.sku || productMeta?.code || "-";
                      const supplier = item.supplierName || selectedSupplierName || "-";
                      const status = statusFromQuantity(item.quantity);
                      return (
                        <tr key={item.id}>
                          <td className={styles.productCell}>{item.productName}</td>
                          <td>{sku}</td>
                          <td>{supplier}</td>
                          <td>{item.locationLabel || item.locationCode || item.locationName}</td>
                          <td>{item.quantity}</td>
                          <td>{formatDateTime(item.lastMovement)}</td>
                          <td>
                            <span className={`${styles.status} ${styles[status.tone]}`}>
                              <span className={styles.dot} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </div>

            <footer className={styles.paginationFooter}>
              <p className={styles.paginationText}>
                Showing {pageStart}-{pageEnd} of {results.length}
              </p>

              <div className={styles.paginationControls}>
                <label className={styles.pageSize}>
                  Rows
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    disabled={!results.length}
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>

                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || !results.length}
                >
                  Prev
                </button>

                <span className={styles.pageIndex}>
                  Page {results.length ? page : 0} / {results.length ? totalPages : 0}
                </span>

                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || !results.length}
                >
                  Next
                </button>
              </div>
            </footer>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.sideCard}>
            <h3>Filter Summary</h3>
            {selectedFilters.length ? (
              <ul className={styles.filterSummaryList}>
                {selectedFilters.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.sideInfo}>No filters selected. Showing broad inventory scope.</p>
            )}
          </section>

          <section className={styles.sideCard}>
            <h3>Search Tips</h3>
            <ul className={styles.tipsList}>
              <li>Use Zone, Rack, and Shelf together to narrow to exact storage lanes.</li>
              <li>Search product by name prefix to quickly find specific SKUs.</li>
              <li>Clear filters before starting a new lookup to avoid hidden constraints.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
