import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
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
    companyName: item.companyName || "-",
  }));
}

export default function SupplierManagementPage() {
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
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

  useEffect(() => {
    loadSuppliers();
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
      address: "",
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

  return (
    <section className={styles.page}>
      <PageHeader
        title="Supplier Management"
        subtitle="Create and manage your suppliers."
      />

      <SupplierForm
        form={form}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={Boolean(editingId)}
        isSubmitting={saving}
        error={formError}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}

