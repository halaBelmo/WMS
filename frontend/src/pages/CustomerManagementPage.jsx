import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CustomerForm from "../components/CustomerForm";
import CustomerTable from "../components/CustomerTable";
import api from "../services/api";
import styles from "./CustomerManagementPage.module.css";

function normalizeCustomers(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || "-",
    address: item.address || "-",
  }));
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

  if (type === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

  if (type === "summary") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export default function CustomerManagementPage() {
  const { role } = useAuth();
  const canManage = role === "ADMIN";

  const [customers, setCustomers] = useState([]);
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
    address: "",
  });

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/customers");
      setCustomers(normalizeCustomers(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
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

    if (!canManage) {
      setFormError("You are not allowed to create or edit customers.");
      return;
    }

    setSaving(true);
    setFormError("");

    if (!form.name || !form.email) {
      setFormError("Name and email are required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
    };

    try {
      if (editingId) {
        await api.put(`/api/customers/${editingId}`, payload);
      } else {
        await api.post("/api/customers", payload);
      }
      resetForm();
      await loadCustomers();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetCustomer) => {
    if (!canManage) return;

    setEditingId(targetCustomer.id);
    setForm({
      name: targetCustomer.name || "",
      email: targetCustomer.email || "",
      phone: targetCustomer.phone === "-" ? "" : targetCustomer.phone,
      address: targetCustomer.address === "-" ? "" : targetCustomer.address,
    });
    setFormError("");
  };

  const handleDelete = async (targetCustomer) => {
    if (!canManage) return;

    const confirmed = window.confirm(`Delete customer ${targetCustomer.name}?`);
    if (!confirmed) return;

    setDeletingId(targetCustomer.id);
    setError("");

    try {
      await api.delete(`/api/customers/${targetCustomer.id}`);
      await loadCustomers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete customer.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (!customers.length) return;

    const headers = ["Customer", "Email", "Phone", "Address"];
    const lines = customers.map((item) => [
      csvEscape(item.name),
      csvEscape(item.email),
      csvEscape(item.phone || "-"),
      csvEscape(item.address || "-"),
    ].join(","));

    const content = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    anchor.href = url;
    anchor.download = `customers-${stamp}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    const hasValue = (value) => {
      const normalized = String(value ?? "").trim();
      return normalized !== "" && normalized !== "-";
    };

    const total = customers.length;
    const active = customers.filter((item) => item.name && item.email).length;
    const completeProfiles = customers.filter(
      (item) => item.name && item.email && hasValue(item.phone) && hasValue(item.address)
    ).length;
    const completionRate = total ? Math.round((completeProfiles / total) * 100) : 0;

    return {
      total,
      active,
      completeProfiles,
      completionRate,
    };
  }, [customers]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Customer Management</h1>
          <p className={styles.subtitle}>Manage warehouse customers and contact information.</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.countBadge}>
            <Icon type="users" />
            {customers.length} Customers
          </span>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExport}
            disabled={!customers.length}
          >
            <Icon type="export" />
            Export
          </button>
        </div>
      </header>

      <div className={styles.topGrid}>
        <div className={styles.formColumn}>
          {canManage ? (
            <CustomerForm
              form={form}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              isEditing={Boolean(editingId)}
              isSubmitting={saving}
              error={formError}
            />
          ) : (
            <div className={styles.readonlyCard}>
              <p>
                You have read-only access to customers. Contact an administrator to create,
                edit, or delete records.
              </p>
            </div>
          )}
        </div>

        <aside className={styles.summaryPanel}>
          <div className={styles.summaryHeader}>
            <Icon type="summary" />
            <h2>Customer Summary</h2>
          </div>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryWidget}>
              <span>Total Customers</span>
              <strong>{summary.total}</strong>
            </div>
            <div className={styles.summaryWidget}>
              <span>Active Customers</span>
              <strong>{summary.active}</strong>
              <small>{summary.total ? `${summary.active}/${summary.total}` : "0/0"}</small>
            </div>
            <div className={styles.summaryWidget}>
              <span>Profile Completion</span>
              <strong>{summary.completionRate}%</strong>
              <small>{summary.completeProfiles} complete profiles</small>
            </div>
          </div>
        </aside>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2>Customers</h2>
          <p>Customer directory and contact details.</p>
        </div>
        <CustomerTable
          customers={customers}
          loading={loading}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canManage={canManage}
        />
      </section>
    </section>
  );
}
