import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import LocationForm from "../components/LocationForm";
import LocationTable from "../components/LocationTable";
import api from "../services/api";
import styles from "./LocationManagementPage.module.css";

function normalizeLocations(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    zone: item.zone,
    rack: item.rack,
    etager: item.etager,
    warehouseId: item.warehouseId,
    warehouseName: item.warehouseName || "-",
  }));
}

export default function LocationManagementPage() {
  const { user } = useAuth();
  const currentWarehouseId = user?.warehouseId || user?.warehouse?.id || "";

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);

  const [form, setForm] = useState({
    name: "",
    zone: "",
    rack: "",
    etager: "",
    warehouseId: currentWarehouseId,
  });

  const loadLocations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/locations");
      setLocations(normalizeLocations(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      zone: "",
      rack: "",
      etager: "",
      warehouseId: currentWarehouseId,
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

    if (!form.name || !form.warehouseId) {
      setFormError("Name and warehouseId are required.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      warehouseId: Number(form.warehouseId),
    };

    try {
      if (editingId) {
        await api.put(`/api/locations/${editingId}`, payload);
      } else {
        await api.post("/api/locations", payload);
      }
      resetForm();
      await loadLocations();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save location.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetLocation) => {
    setEditingId(targetLocation.id);
    setEditingSnapshot({
      warehouseId: targetLocation.warehouseId,
    });
    setForm({
      name: targetLocation.name || "",
      zone: targetLocation.zone || "",
      rack: targetLocation.rack || "",
      etager: targetLocation.etager || "",
      warehouseId: targetLocation.warehouseId || currentWarehouseId,
    });
    setFormError("");
  };

  const handleDelete = async (targetLocation) => {
    const confirmed = window.confirm(`Delete location ${targetLocation.name}?`);
    if (!confirmed) return;

    setDeletingId(targetLocation.id);
    setError("");

    try {
      await api.delete(`/api/locations/${targetLocation.id}`);
      await loadLocations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete location.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="Location Management"
        subtitle="Create and manage locations (emplacements) in your warehouse."
      />

      <LocationForm
        form={form}
        currentWarehouseId={currentWarehouseId}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={Boolean(editingId)}
        isSubmitting={saving}
        error={formError}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <LocationTable
        locations={locations}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
