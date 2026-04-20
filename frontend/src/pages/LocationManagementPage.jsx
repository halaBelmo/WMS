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
  const [racksLoading, setRacksLoading] = useState(false);
  const [shelvesLoading, setShelvesLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");

  const [form, setForm] = useState({
    name: "",
    shelfId: "",
    warehouseId: currentWarehouseId,
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
      setShelves([]);
      setSelectedRack("");
      setSelectedShelf("");
      return;
    }
    setRacksLoading(true);
    try {
      const response = await api.get(`/api/racks?zoneId=${zoneId}`);
      setRacks(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load racks.");
    } finally {
      setRacksLoading(false);
    }
  };

  const loadShelves = async (rackId) => {
    if (!rackId) {
      setShelves([]);
      setSelectedShelf("");
      return;
    }
    setShelvesLoading(true);
    try {
      const response = await api.get(`/api/shelves?rackId=${rackId}`);
      setShelves(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load shelves.");
    } finally {
      setShelvesLoading(false);
    }
  };

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
    loadZones();
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      loadRacks(selectedZone);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedRack) {
      loadShelves(selectedRack);
    }
  }, [selectedRack]);

const resetForm = () => {
    setForm({
      name: "",
      shelfId: "",
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

    if (!form.name || !form.shelfId) {
      setFormError("Name and Shelf are required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      shelfId: Number(form.shelfId),
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

  const handleZoneChange = (zoneId) => {
    setSelectedZone(zoneId);
    setSelectedRack("");
    setSelectedShelf("");
  };

  const handleRackChange = (rackId) => {
    setSelectedRack(rackId);
    setSelectedShelf("");
  };

  const handleShelfChange = (shelfId) => {
    setSelectedShelf(shelfId);
    setForm((prev) => ({ ...prev, shelfId: shelfId }));
  };

  const handleEdit = (targetLocation) => {
    setEditingId(targetLocation.id);
    setEditingSnapshot({
      warehouseId: targetLocation.warehouseId,
    });
    setForm({
      name: targetLocation.name || "",
      shelfId: "",
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

      <div className={styles.hierarchySection}>
        <h4>Select Hierarchy</h4>
        <div className={styles.selectRow}>
          <div className={styles.field}>
            <label>Zone</label>
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
              <div className={styles.field}>
                <label>Rack</label>
                <select 
                  value={selectedRack} 
                  onChange={(e) => handleRackChange(e.target.value)}
                  className={styles.select}
                  disabled={racksLoading}
                >
                  <option value="">-- Choose Rack --</option>
                  {racks.map((rack) => (
                    <option key={rack.id} value={rack.id}>
                      {rack.code}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRack && (
                <div className={styles.field}>
                  <label>Shelf</label>
                  <select 
                    value={selectedShelf} 
                    onChange={(e) => handleShelfChange(e.target.value)}
                    className={styles.select}
                    disabled={shelvesLoading}
                  >
                    <option value="">-- Choose Shelf --</option>
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedShelf && (
<LocationForm
          form={form}
          shelves={shelves}
          selectedShelf={selectedShelf}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={Boolean(editingId)}
          isSubmitting={saving}
          error={formError}
          shelves={shelves}
        />
      )}

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
