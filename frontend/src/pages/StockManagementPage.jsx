import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StockForm from "../components/StockForm";
import StockTable from "../components/StockTable";
import api from "../services/api";
import styles from "./StockManagementPage.module.css";

function normalizeStocks(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName || "-",
    locationId: item.locationId,
    locationName: item.locationName || "-",
    quantity: item.quantity || 0,
  }));
}

export default function StockManagementPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Hierarchy state
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [racksLoading, setRacksLoading] = useState(false);
  const [shelvesLoading, setShelvesLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    quantity: 0,
  });

  // Load zones on mount
  const loadZones = async () => {
    try {
      const response = await api.get("/api/zones");
      setZones(response.data || []);
    } catch (err) {
      console.error("Could not load zones:", err);
    }
  };

  // Load racks when zone changes
  const loadRacks = async (zoneId) => {
    if (!zoneId) {
      setRacks([]);
      setShelves([]);
      setLocations([]);
      setSelectedRack("");
      setSelectedShelf("");
      setSelectedLocation("");
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

  // Load shelves when rack changes
  const loadShelves = async (rackId) => {
    if (!rackId) {
      setShelves([]);
      setLocations([]);
      setSelectedShelf("");
      setSelectedLocation("");
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

  // Load locations when shelf changes
  const loadLocations = async (shelfId) => {
    if (!shelfId) {
      setLocations([]);
      setSelectedLocation("");
      return;
    }
    setLocationsLoading(true);
    try {
      const response = await api.get(`/api/locations/shelf/${shelfId}`);
      setLocations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load locations.");
    } finally {
      setLocationsLoading(false);
    }
  };

  // Load all stocks (will be filtered by selected location on frontend)
  const loadStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/stocks");
      setStocks(normalizeStocks(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load stocks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
    loadStocks();
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

  useEffect(() => {
    if (selectedShelf) {
      loadLocations(selectedShelf);
    }
  }, [selectedShelf]);

  const resetForm = () => {
    setForm({
      productId: "",
      quantity: 0,
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

    if (!form.productId || !selectedLocation || form.quantity === "") {
      setFormError("Product, location and quantity are required.");
      setSaving(false);
      return;
    }

    const payload = {
      productId: Number(form.productId),
      locationId: Number(selectedLocation),
      quantity: Number(form.quantity),
    };

    try {
      if (editingId) {
        await api.put(`/api/stocks/${editingId}`, payload);
      } else {
        await api.post("/api/stocks", payload);
      }
      resetForm();
      await loadStocks();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not save stock.");
    } finally {
      setSaving(false);
    }
  };

  const handleZoneChange = (zoneId) => {
    setSelectedZone(zoneId);
    setSelectedRack("");
    setSelectedShelf("");
    setSelectedLocation("");
    setLocations([]);
    setShelves([]);
  };

  const handleRackChange = (rackId) => {
    setSelectedRack(rackId);
    setSelectedShelf("");
    setSelectedLocation("");
    setLocations([]);
  };

  const handleShelfChange = (shelfId) => {
    setSelectedShelf(shelfId);
    setSelectedLocation("");
  };

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
  };

  const handleEdit = (targetStock) => {
    setEditingId(targetStock.id);
    setForm({
      productId: targetStock.productId || "",
      quantity: targetStock.quantity || 0,
    });
    // Also set the hierarchy to match the stock's location if possible
    setSelectedLocation(targetStock.locationId || "");
    setFormError("");
  };

  const handleDelete = async (targetStock) => {
    const confirmed = window.confirm(`Delete stock #${targetStock.id}?`);
    if (!confirmed) return;

    setDeletingId(targetStock.id);
    setError("");

    try {
      await api.delete(`/api/stocks/${targetStock.id}`);
      await loadStocks();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete stock.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter stocks by selected location
  const filteredStocks = selectedLocation
    ? stocks.filter((s) => String(s.locationId) === String(selectedLocation))
    : stocks;

  // Get selected location name for display
  const selectedLocationName =
    locations.find((l) => String(l.id) === String(selectedLocation))?.name || "";

  return (
    <section className={styles.page}>
      <PageHeader
        title="Stock Management"
        subtitle="Manage product quantities per location."
      />

      {/* Hierarchy Selection */}
      <div className={styles.hierarchySection}>
        <h4 className={styles.hierarchyTitle}>Select Location Hierarchy</h4>
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
          )}

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
                    {shelf.code || shelf.level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedShelf && (
            <div className={styles.field}>
              <label>Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className={styles.select}
                disabled={locationsLoading}
              >
                <option value="">-- Choose Location --</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {selectedLocation && (
        <StockForm
          form={form}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={Boolean(editingId)}
          isSubmitting={saving}
          error={formError}
          locationId={selectedLocation}
          locationName={selectedLocationName}
        />
      )}

      {!selectedLocation && (
        <p className={styles.infoMessage}>
          Please select a Zone → Rack → Shelf → Location to create or manage stock.
        </p>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      <StockTable
        stocks={filteredStocks}
        loading={loading}
        deletingId={deletingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}

