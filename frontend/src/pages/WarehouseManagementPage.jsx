import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import WarehouseForm from "../components/WarehouseForm";
import WarehouseList from "../components/WarehouseList";
import api from "../services/api";
import styles from "./WarehouseManagementPage.module.css";

function normalizeWarehouses(data) {
  const list = Array.isArray(data) ? data : data?.warehouses || data?.data || [];
  return list.map((item) => ({
    id: item.id ?? item.warehouseId,
    name: item.name ?? item.warehouseName,
    location: item.location ?? item.address ?? "",
  }));
}

export default function WarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({ name: "", location: "" });

  const loadWarehouses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/owner/warehouses");
      setWarehouses(normalizeWarehouses(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      await api.post("/api/owner/warehouses", form);
      setForm({ name: "", location: "" });
      await loadWarehouses();
    } catch (requestError) {
      setCreateError(requestError.response?.data?.message || "Could not create warehouse.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (warehouse) => {
    const confirmed = window.confirm(`Delete warehouse ${warehouse.name}?`);
    if (!confirmed) return;

    setDeletingId(warehouse.id);
    setError("");

    try {
      await api.delete(`/api/owner/warehouses/${warehouse.id}`);
      await loadWarehouses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete warehouse.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="Warehouse Management"
        subtitle="Create and review warehouses belonging to your company."
      />

      <WarehouseForm
        form={form}
        onChange={handleChange}
        onSubmit={handleCreate}
        loading={creating}
        error={createError}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <WarehouseList
        warehouses={warehouses}
        loading={loading}
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </section>
  );
}
