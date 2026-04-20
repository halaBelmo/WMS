import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import RackForm from "../components/RackForm";
import RackTable from "../components/RackTable";
import api from "../services/api";
import styles from "./RackManagementPage.module.css";

function normalizeZones(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

function normalizeRacks(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    code: item.code,
    zoneName: item.zone?.name || item.zoneName || "-",
  }));
}

export default function RackManagementPage() {
  const { user } = useAuth();
  const [racks, setRacks] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [loading, setLoading] = useState(true);
  const [racksLoading, setRacksLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    zoneId: "",
  });

  const loadZones = async () => {
    try {
      const response = await api.get("/api/zones");
      setZones(normalizeZones(response.data));
    } catch (err) {
      console.error("Could not load zones:", err);
    }
  };

  const loadRacks = async (zoneId) => {
    if (!zoneId) return;
    setRacksLoading(true);
    try {
      const response = await api.get(`/api/racks?zoneId=${zoneId}`);
      setRacks(normalizeRacks(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load racks.");
    } finally {
      setRacksLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    loadRacks(selectedZone);
    setForm((prev) => ({ ...prev, zoneId: selectedZone }));
  }, [selectedZone]);

  const resetForm = () => {
    setForm({
      code: "",
      zoneId: selectedZone,
    });
    setEditingId(null);
    setFormError("");
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleZoneChange = (zoneId) => {
    setSelectedZone(zoneId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.code || !form.zoneId) {
      setFormError("Code and Zone are required.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      zoneId: Number(form.zoneId),
    };

    try {
      if (editingId) {
        await api.put(`/api/racks/${editingId}`, payload);
      } else {
        await api.post("/api/racks", payload);
      }
      resetForm();
      await loadRacks(form.zoneId);
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save rack.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetRack) => {
    setEditingId(targetRack.id);
    setForm({
      code: targetRack.code || "",
      zoneId: selectedZone || "",
    });
  };

  const handleDelete = async (targetRack) => {
    const confirmed = window.confirm(`Delete rack ${targetRack.code}?`);
    if (!confirmed) return;

    setDeletingId(targetRack.id);
    try {
      await api.delete(`/api/racks/${targetRack.id}`);
      await loadRacks(selectedZone);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete rack.");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedZoneObj = zones.find(z => z.id === selectedZone);

  return (
    <section className={styles.page}>
      <PageHeader
        title="Rack Management"
        subtitle="Create and manage racks within zones."
      />

      <div className={styles.formSection}>
        <label className={styles.zoneLabel}>Select Zone</label>
        <select 
          value={selectedZone} 
          onChange={(e) => handleZoneChange(e.target.value)}
          className={styles.zoneSelect}
        >
          <option value="">-- Choose Zone --</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      <RackForm
        form={form}
        zones={zones}
        selectedZone={selectedZone}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isEditing={Boolean(editingId)}
        isSubmitting={saving}
        error={formError}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      {selectedZone && (
        <RackTable
          racks={racks}
          loading={racksLoading}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          zoneName={selectedZoneObj?.name || "Selected Zone"}
        />
      )}

    </section>
  );
}

