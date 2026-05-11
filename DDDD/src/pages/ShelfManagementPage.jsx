import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import ShelfForm from "../components/ShelfForm";
import ShelfTable from "../components/ShelfTable";
import RackTable from "../components/RackTable";
import api from "../services/api";
import styles from "./ShelfManagementPage.module.css";

function normalizeShelves(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    code: item.code,
    rackCode: item.rack?.code || item.rackCode || "-",
  }));
}

function normalizeRacks(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    code: item.code,
    zoneName: item.zone?.name || "-",
  }));
}

export default function ShelfManagementPage() {
  const [shelves, setShelves] = useState([]);
  const [racks, setRacks] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [loading, setLoading] = useState(true);
  const [shelvesLoading, setShelvesLoading] = useState(false);
  const [racksLoading, setRacksLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    rackId: "",
  });

  const loadZones = async () => {
    try {
      const response = await api.get("/api/zones");
      setZones(response.data || []);
    } catch (err) {
      console.error("Could not load zones:", err);
    }
  };

  const loadRacks = async (zoneId) => {
    if (!zoneId) {
      setRacks([]);
      return;
    }
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

  const loadShelves = async (rackId) => {
    if (!rackId) {
      setShelves([]);
      return;
    }
    setShelvesLoading(true);
    try {
      const response = await api.get(`/api/shelves?rackId=${rackId}`);
      setShelves(normalizeShelves(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load shelves.");
    } finally {
      setShelvesLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    loadRacks(selectedZone);
    setSelectedRack("");
    setForm((prev) => ({ ...prev, rackId: "" }));
  }, [selectedZone]);

  useEffect(() => {
    loadShelves(selectedRack);
    setForm((prev) => ({ ...prev, rackId: selectedRack }));
  }, [selectedRack]);

  const resetForm = () => {
    setForm({
      code: "",
      rackId: selectedRack,
    });
    setEditingId(null);
    setFormError("");
  };

  const handleZoneChange = (zoneId) => {
    setSelectedZone(zoneId);
  };

  const handleRackChange = (rackId) => {
    setSelectedRack(rackId);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.code || !form.rackId) {
      setFormError("Code and Rack are required.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      rackId: Number(form.rackId),
    };

    try {
      if (editingId) {
        await api.put(`/api/shelves/${editingId}`, payload);
      } else {
        await api.post("/api/shelves", payload);
      }
      resetForm();
      await loadShelves(form.rackId);
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save shelf.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (targetShelf) => {
    setEditingId(targetShelf.id);
    setForm({
      code: targetShelf.code || "",
      rackId: selectedRack || "",
    });
  };

  const handleDelete = async (targetShelf) => {
    const confirmed = window.confirm(`Delete shelf ${targetShelf.code}?`);
    if (!confirmed) return;

    setDeletingId(targetShelf.id);
    try {
      await api.delete(`/api/shelves/${targetShelf.id}`);
      await loadShelves(selectedRack);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete shelf.");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedRackObj = racks.find(r => r.id == selectedRack);
  const selectedZoneObj = zones.find(z => z.id == selectedZone);

  return (
    <section className={styles.page}>
      <PageHeader
        title="Shelf Management"
        subtitle="Create and manage shelves within racks."
      />

      <div className={styles.zoneSection}>
        <label>Select Zone</label>
        <select 
          value={selectedZone} 
          onChange={(e) => handleZoneChange(e.target.value)}
          className={styles.select}
        >
          <option value="">-- Choose Zone --</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      {selectedZone && (
        <>
          <RackTable
            racks={racks}
            loading={racksLoading}
            deletingId={null}
            onEdit={() => {}}
            onDelete={() => {}}
            zoneName={selectedZoneObj?.name || "Zone"}
          />
          {racks.length > 0 && (
            <div className={styles.rackSection}>
              <label>Select Rack</label>
              <select 
                value={selectedRack} 
                onChange={(e) => handleRackChange(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Choose Rack --</option>
                {racks.map((rack) => (
                  <option key={rack.id} value={rack.id}>
                    {rack.code}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {selectedRack && (
        <ShelfForm
          form={form}
          racks={racks}
          selectedRack={selectedRack}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={Boolean(editingId)}
          isSubmitting={saving}
          error={formError}
        />
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      {selectedRack && (
        <ShelfTable
          shelves={shelves}
          loading={shelvesLoading}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rackCode={selectedRackObj?.code || "Selected Rack"}
        />
      )}
    </section>
  );
}

