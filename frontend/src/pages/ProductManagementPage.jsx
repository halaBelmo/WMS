import { useEffect, useMemo, useRef, useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";
import api from "../services/api";
import styles from "./ProductManagementPage.module.css";

function normalizeProducts(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    price: item.price ?? 0,
    supplierId: item.supplierId,
    supplierName: item.supplierName || "-",
  }));
}

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

  if (type === "stock") {
    return (
      <svg {...common}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  if (type === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (type === "export") {
    return (
      <svg {...common}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10 12 15l5-5" />
        <path d="M12 15V3" />
      </svg>
    );
  }

  if (type === "status") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

export default function ProductManagementPage() {
  const formAnchorRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [sortByPrice, setSortByPrice] = useState("default");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    supplierId: "",
  });

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/owner/products");
      setProducts(normalizeProducts(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      supplierId: "",
    });
    setEditingId(null);
    setFormError("");
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.name || form.price === "") {
      setFormError("Name and price are required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || "",
      price: Number(form.price),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
    };

    try {
      if (editingId) {
        await api.put(`/api/owner/products/${editingId}`, payload);
      } else {
        await api.post("/api/owner/products", payload);
      }
      resetForm();
      await loadProducts();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetProduct) => {
    setEditingId(targetProduct.id);
    setForm({
      name: targetProduct.name || "",
      description: targetProduct.description || "",
      price: targetProduct.price ?? "",
      supplierId: targetProduct.supplierId || "",
    });
    setFormError("");
  };

  const handleDelete = async (targetProduct) => {
    const confirmed = window.confirm(`Delete product ${targetProduct.name}?`);
    if (!confirmed) return;

    setDeletingId(targetProduct.id);
    setError("");

    try {
      await api.delete(`/api/owner/products/${targetProduct.id}`);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const searchText = searchValue.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch = !searchText
        ? true
        : `${product.name} ${product.description} ${product.supplierName}`.toLowerCase().includes(searchText);

      const matchesSupplier = !supplierFilter
        ? true
        : String(product.supplierId ?? "") === String(supplierFilter);

      return matchesSearch && matchesSupplier;
    });

    if (sortByPrice === "asc") {
      return [...filtered].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortByPrice === "desc") {
      return [...filtered].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return filtered;
  }, [products, searchValue, supplierFilter, sortByPrice]);

  const supplierFilterOptions = useMemo(() => {
    const mapped = new Map();
    products.forEach((product) => {
      const id = String(product.supplierId ?? "");
      const name = product.supplierName || "No supplier";
      if (!id || mapped.has(id)) return;
      mapped.set(id, { id, name });
    });
    return Array.from(mapped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const selectedSupplierLabel = useMemo(() => {
    if (!form.supplierId) return "Not selected";
    const selected = suppliers.find((item) => String(item.id) === String(form.supplierId));
    return selected?.name || "Selected supplier";
  }, [suppliers, form.supplierId]);

  const stockStatusLabel = useMemo(() => {
    if (!form.name.trim()) return "Draft";
    if (Number(form.price || 0) <= 0) return "Needs pricing";
    return "Ready for catalog";
  }, [form.name, form.price]);

  const exportProducts = () => {
    const rows = [
      ["Product", "Supplier", "Price", "Description"],
      ...filteredProducts.map((item) => [
        item.name || "",
        item.supplierName || "",
        String(item.price ?? ""),
        item.description || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const focusCreateForm = () => {
    resetForm();
    formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Product Management</h1>
          <p className={styles.subtitle}>Manage warehouse products, suppliers, and inventory catalog.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.countBadge}>
            <span className={styles.badgeIcon}><Icon type="stock" /></span>
            {products.length} Products
          </span>
          <button type="button" className={styles.primaryActionBtn} onClick={focusCreateForm}>
            <Icon type="plus" />
            Add Product
          </button>
          <button type="button" className={styles.secondaryActionBtn} onClick={exportProducts}>
            <Icon type="export" />
            Export
          </button>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div ref={formAnchorRef}>
          <ProductForm
            form={form}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isEditing={Boolean(editingId)}
            isSubmitting={saving}
            error={formError}
            onSuppliersLoaded={setSuppliers}
          />
        </div>

        <aside className={styles.previewCard}>
          <div className={styles.previewHead}>
            <span className={styles.previewIcon}><Icon type="stock" /></span>
            <div>
              <h3>Product Preview</h3>
              <p>Live form summary</p>
            </div>
          </div>

          <div className={styles.previewRows}>
            <div className={styles.previewRow}>
              <span>Product Name</span>
              <strong>{form.name?.trim() || "Not set"}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Supplier</span>
              <strong>{selectedSupplierLabel}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Price</span>
              <strong>{formatMoney(form.price || 0)}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Description</span>
              <strong className={styles.previewDescription}>{form.description?.trim() || "No description yet"}</strong>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.statusLabel}>
                <Icon type="status" />
                Stock Status
              </span>
              <strong>{stockStatusLabel}</strong>
            </div>
          </div>
        </aside>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <ProductTable
        products={filteredProducts}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        supplierFilter={supplierFilter}
        onSupplierFilterChange={setSupplierFilter}
        sortByPrice={sortByPrice}
        onSortByPriceChange={setSortByPrice}
        supplierOptions={supplierFilterOptions}
      />
    </section>
  );
}

