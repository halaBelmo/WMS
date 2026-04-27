import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
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
    id: item.id,
    productName: item.productName || "-",
    locationName: item.locationName || "-",
    quantity: item.quantity ?? 0,
  }));
}

function FilterSelect({ label, value, options, onChange, placeholder = "All" }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function StockSearchPage() {
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
    } catch (parseError) {
      setWarehouseIdFromUser(undefined);
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

    try {
      const response = await api.get("/api/stocks/search", { params: searchParams });
      setResults(mapStocks(response.data));
    } catch (requestError) {
      setResults([]);
      setError(requestError.response?.data?.message || "Could not search stocks.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="Stock Search"
        subtitle="Search stock by product and warehouse hierarchy."
      />

      <div className={styles.filtersCard}>
        {loadingFilters ? <p className={styles.info}>Loading filters...</p> : null}

        {!loadingFilters ? (
          <>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Product Name</label>
                <input
                  type="text"
                  list="product-name-options"
                  value={filters.productName}
                  placeholder="Type product name"
                  onChange={(event) => updateFilter("productName", event.target.value)}
                />
                <datalist id="product-name-options">
                  {productSuggestions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <FilterSelect
                label="Supplier"
                value={filters.supplierId}
                options={suppliers}
                onChange={(value) => updateFilter("supplierId", value)}
              />
              <FilterSelect
                label="Zone"
                value={filters.zoneId}
                options={zones}
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    zoneId: value,
                    rackId: "",
                    shelfId: "",
                  }));
                }}
              />
              <FilterSelect
                label="Rack"
                value={filters.rackId}
                options={racks}
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    rackId: value,
                    shelfId: "",
                  }));
                }}
                placeholder={filters.zoneId ? "All" : "Select Zone first"}
              />
              <FilterSelect
                label="Shelf"
                value={filters.shelfId}
                options={shelves}
                onChange={(value) => updateFilter("shelfId", value)}
                placeholder={filters.rackId ? "All" : "Select Rack first"}
              />
            </div>

            <div className={styles.actions}>
              <Button onClick={handleSearch} fullWidth={false} disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.tableCard}>
        {searching ? <p className={styles.info}>Searching stock...</p> : null}

        {!searching && hasSearched && !results.length && !error ? (
          <p className={styles.info}>No stock results found.</p>
        ) : null}

        {!searching && results.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Location Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.locationName}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {!hasSearched && !searching ? (
          <p className={styles.info}>Set filters and click Search to see results.</p>
        ) : null}
      </div>
    </section>
  );
}

