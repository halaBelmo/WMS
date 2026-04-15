import { useState, useEffect } from "react";
import Button from "./Button";
import styles from "./ProductForm.module.css";
import api from "../services/api";

export default function ProductForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cascade state
  const selectedZoneId = form.zoneId;
  const selectedRackId = form.rackId;
  const selectedShelfId = form.shelfId;
  const selectedLocationId = form.locationId;

  // Load zones (user warehouse auto)
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await api.get("/api/zones");
        setZones(response.data);
      } catch (err) {
        console.error("Failed to load zones", err);
      }
    };
    loadZones();
  }, []);

  // Load racks when zone changes
  useEffect(() => {
    if (selectedZoneId) {
      const loadRacks = async () => {
        try {
          const response = await api.get(`/api/racks?zoneId=${selectedZoneId}`);
          setRacks(response.data);
          setShelves([]);
          setLocations([]);
        } catch (err) {
          console.error("Failed to load racks", err);
        }
      };
      loadRacks();
    } else {
      setRacks([]);
    }
  }, [selectedZoneId]);

  // Load shelves when rack changes
  useEffect(() => {
    if (selectedRackId) {
      const loadShelves = async () => {
        try {
          const response = await api.get(`/api/shelves?rackId=${selectedRackId}`);
          setShelves(response.data);
          setLocations([]);
        } catch (err) {
          console.error("Failed to load shelves", err);
        }
      };
      loadShelves();
    } else {
      setShelves([]);
    }
  }, [selectedRackId]);

  // Load locations when shelf changes
  useEffect(() => {
    if (selectedShelfId) {
      const loadLocations = async () => {
        try {
          const response = await api.get(`/api/locations/shelf/${selectedShelfId}`);
          setLocations(response.data);
        } catch (err) {
          console.error("Failed to load locations", err);
        }
      };
      loadLocations();
    } else {
      setLocations([]);
    }
  }, [selectedShelfId]);

  // Load suppliers
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await api.get("/api/suppliers");
        setSuppliers(response.data);
      } catch (err) {
        console.error("Failed to load suppliers", err);
      }
    };
    loadSuppliers();
  }, []);

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h3 className={styles.title}>{isEditing ? "Update Product" : "Create Product"}</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Reference</label>
          <input
            value={form.reference}
            onChange={(event) => onChange("reference", event.target.value)}
            placeholder="Product reference"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Nom</label>
          <input
            value={form.nom}
            onChange={(event) => onChange("nom", event.target.value)}
            placeholder="Product name"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="Product description"
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label>Catégorie</label>
          <input
            value={form.categorie}
            onChange={(event) => onChange("categorie", event.target.value)}
            placeholder="Product category"
          />
        </div>

        <div className={styles.field}>
          <label>Quantité Disponible</label>
          <input
            type="number"
            min="0"
            value={form.quantiteDisponible}
            onChange={(event) => onChange("quantiteDisponible", event.target.value)}
            placeholder="0"
          />
        </div>

        {/* CASCADE LOCATION */}
        <div className={styles.field}>
          <label>Zone</label>
          <select 
            value={form.zoneId || ""} 
            onChange={(event) => {
              onChange("zoneId", event.target.value);
              onChange("rackId", "");
              onChange("shelfId", "");
              onChange("locationId", "");
            }}
          >
            <option value="">Choisir zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Rack</label>
          <select 
            value={form.rackId || ""} 
            onChange={(event) => {
              onChange("rackId", event.target.value);
              onChange("shelfId", "");
              onChange("locationId", "");
            }}
            disabled={!selectedZoneId}
          >
            <option value="">Choisir rack</option>
            {racks.map((rack) => (
              <option key={rack.id} value={rack.id}>
                {rack.code}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Shelf</label>
          <select 
            value={form.shelfId || ""} 
            onChange={(event) => {
              onChange("shelfId", event.target.value);
              onChange("locationId", "");
            }}
            disabled={!selectedRackId}
          >
            <option value="">Choisir shelf</option>
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.code}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Location</label>
          <select 
            value={form.locationId || ""} 
            onChange={(event) => onChange("locationId", event.target.value)}
            disabled={!selectedShelfId}
          >
            <option value="">Choisir location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Fournisseur</label>
          <select 
            value={form.fournisseurId || ""} 
            onChange={(event) => onChange("fournisseurId", event.target.value)}
          >
            <option value="">Choisir fournisseur</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" fullWidth={false} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
        {isEditing ? (
          <Button type="button" variant="outline" fullWidth={false} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

