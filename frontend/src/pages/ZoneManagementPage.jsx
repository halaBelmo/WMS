import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import ZoneForm from "../components/ZoneForm";
import ZoneTable from "../components/ZoneTable";
import api from "../services/api";
import styles from "./ZoneManagementPage.module.css";

function normalizeZones(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    warehouseName: item.warehouse?.name || item.warehouseName || "-",
  }));
}

export default function ZoneManagementPage() {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);

  const [form, setForm] = useState({
    name: "",
  });

  const loadZones = async () => {
    setTableLoading(true);
    setError("");
    try {
      const response = await api.get("/api/zones");
      setZones(normalizeZones(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load zones.");
    } finally {
      setTableLoading(false);
    }
  };



  useEffect(() => {
    loadZones();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
    });
    setEditingId(null);
    setEditingSnapshot(null);
    setFormError("");
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.name) {
      setFormError("Name is required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
    };

    try {
      if (editingId) {
        await api.put(`/api/zones/${editingId}`, payload);
      } else {
        await api.post("/api/zones", payload);
      }
      resetForm();
      await loadZones();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save zone.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetZone) => {
    setEditingId(targetZone.id);
    setEditingSnapshot({ warehouseId: targetZone.id }); // simplistic
    setForm({
      name: targetZone.name || "",
    });
  };

  const handleDelete = async (targetZone) => {
    const confirmed = window.confirm(`Delete zone ${targetZone.name}?`);
    if (!confirmed) return;

    setDeletingId(targetZone.id);
    try {
      await api.delete(`/api/zones/${targetZone.id}`);
      await loadZones();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete zone.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="Zone Management"
        subtitle="Create and manage zones in your warehouses."
      />

      <ZoneForm
        form={form}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={Boolean(editingId)}
        isSubmitting={saving}
        error={formError}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <ZoneTable
        zones={zones}
        loading={tableLoading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}

