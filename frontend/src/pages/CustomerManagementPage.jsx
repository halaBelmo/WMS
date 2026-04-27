import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
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

  return (
    <section className={styles.page}>
      <PageHeader
        title="Customer Management"
        subtitle="Create, update, and review your customers."
      />

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
        <div className={styles.infoCard}>
          <p>
            You have read-only access on customers. Contact an administrator to create,
            modify, or delete records.
          </p>
        </div>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      <CustomerTable
        customers={customers}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canManage={canManage}
      />
    </section>
  );
}
