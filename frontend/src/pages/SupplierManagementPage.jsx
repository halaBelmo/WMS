import { useEffect, useMemo, useRef, useState } from "react";
import SupplierForm from "../components/SupplierForm";
import SupplierTable from "../components/SupplierTable";
import api from "../services/api";
import styles from "./SupplierManagementPage.module.css";

function normalizeSuppliers(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || "-",
    contact: item.contact || "-",
    address: item.address || "-",
    companyName: item.companyName || "-",
  }));
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

  if (type === "supplier") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="4" />
        <path d="M2 21a6 6 0 0 1 12 0" />
        <circle cx="17" cy="7" r="3" />
        <path d="M22 21a5 5 0 0 0-8-4" />
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
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export default function SupplierManagementPage() {
  const formAnchorRef = useRef(null);

  const [suppliers, setSuppliers] = useState([]);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contact: "",
    address: "",
  });

  const [searchValue, setSearchValue] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  const loadSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/owner/suppliers");
      setSuppliers(normalizeSuppliers(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedProducts = async () => {
    try {
      const response = await api.get("/api/owner/products");
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setLinkedProducts(list);
    } catch {
      setLinkedProducts([]);
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadLinkedProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      contact: "",
      address: "",
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

    if (!form.name || !form.email) {
      setFormError("Name and email are required.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
    };

    try {
      if (editingId) {
        await api.put(`/api/owner/suppliers/${editingId}`, payload);
      } else {
        await api.post("/api/owner/suppliers", payload);
      }
      resetForm();
      await loadSuppliers();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetSupplier) => {
    setEditingId(targetSupplier.id);
    setForm({
      name: targetSupplier.name || "",
      email: targetSupplier.email || "",
      phone: targetSupplier.phone || "",
      contact: targetSupplier.contact || "",
      address: targetSupplier.address === "-" ? "" : targetSupplier.address || "",
    });
    setFormError("");
  };

  const handleDelete = async (targetSupplier) => {
    const confirmed = window.confirm(`Delete supplier ${targetSupplier.name}?`);
    if (!confirmed) return;

    setDeletingId(targetSupplier.id);
    setError("");

    try {
      await api.delete(`/api/owner/suppliers/${targetSupplier.id}`);
      await loadSuppliers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete supplier.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSuppliers = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const filtered = suppliers.filter((supplier) => {
      const matchesSearch = !query
        ? true
        : `${supplier.name} ${supplier.email} ${supplier.phone} ${supplier.contact} ${supplier.address}`
          .toLowerCase()
          .includes(query);

      const matchesContact = !contactFilter
        ? true
        : String(supplier.contact || "-") === String(contactFilter);

      return matchesSearch && matchesContact;
    });

    return [...filtered].sort((a, b) => {
      const value = String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" });
      return sortOrder === "za" ? -value : value;
    });
  }, [suppliers, searchValue, contactFilter, sortOrder]);

  const contactOptions = useMemo(() => {
    const set = new Set(
      suppliers
        .map((item) => item.contact || "-")
        .filter((item) => item && item !== "-")
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suppliers]);

  const activeSuppliersCount = useMemo(
    () => suppliers.filter((item) => item.email && item.email !== "-" && item.phone && item.phone !== "-").length,
    [suppliers]
  );

  const linkedProductsCount = useMemo(
    () => linkedProducts.filter((item) => item.supplierId != null).length,
    [linkedProducts]
  );

  const supplierPreview = {
    name: form.name?.trim() || "Not set",
    contact: form.contact?.trim() || "Not set",
    email: form.email?.trim() || "Not set",
    phone: form.phone?.trim() || "Not set",
    address: form.address?.trim() || "Not set",
  };

  const exportSuppliers = () => {
    const rows = [
      ["Supplier", "Contact", "Email", "Phone", "Address"],
      ...filteredSuppliers.map((item) => [
        item.name || "",
        item.contact || "",
        item.email || "",
        item.phone || "",
        item.address || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "suppliers-export.csv";
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
          <h1 className={styles.title}>Supplier Management</h1>
          <p className={styles.subtitle}>Manage warehouse suppliers and supplier contacts.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.countBadge}>
            <span className={styles.badgeIcon}><Icon type="supplier" /></span>
            {suppliers.length} Suppliers
          </span>
          <button type="button" className={styles.secondaryActionBtn} onClick={exportSuppliers}>
            <Icon type="export" />
            Export
          </button>
          <button type="button" className={styles.primaryActionBtn} onClick={focusCreateForm}>
            <Icon type="plus" />
            Add Supplier
          </button>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div ref={formAnchorRef}>
          <SupplierForm
            form={form}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isEditing={Boolean(editingId)}
            isSubmitting={saving}
            error={formError}
          />
        </div>

        <aside className={styles.previewCard}>
          <div className={styles.previewHead}>
            <span className={styles.previewIcon}><Icon type="supplier" /></span>
            <div>
              <h3>Supplier Preview</h3>
              <p>Live form summary</p>
            </div>
          </div>

          <div className={styles.previewRows}>
            <div className={styles.previewRow}>
              <span>Supplier Name</span>
              <strong>{supplierPreview.name}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Contact Person</span>
              <strong>{supplierPreview.contact}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Email</span>
              <strong>{supplierPreview.email}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Phone</span>
              <strong>{supplierPreview.phone}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Address</span>
              <strong className={styles.previewAddress}>{supplierPreview.address}</strong>
            </div>
          </div>

          <div className={styles.widgetGrid}>
            <article className={styles.widgetCard}>
              <span>Total Suppliers</span>
              <strong>{suppliers.length}</strong>
            </article>
            <article className={styles.widgetCard}>
              <span>Active Suppliers</span>
              <strong>{activeSuppliersCount}</strong>
            </article>
            <article className={styles.widgetCard}>
              <span className={styles.linkedLabel}>
                <Icon type="status" />
                Linked Products
              </span>
              <strong>{linkedProductsCount}</strong>
            </article>
          </div>
        </aside>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <SupplierTable
        suppliers={filteredSuppliers}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        contactFilter={contactFilter}
        onContactFilterChange={setContactFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        contactOptions={contactOptions}
      />
    </section>
  );
}

