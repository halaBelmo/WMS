import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import StockForm from "../components/StockForm";
import StockSearchPage from "./StockSearchPage";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./StockManagementPage.module.css";

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function buildLocationCode(item) {
  const leafName = item.name || item.locationName || "";
  if (item.zone && item.rack && item.etager && leafName) {
    return `${item.zone}-${item.rack}-${item.etager}-${leafName}`;
  }
  return "";
}

function normalizeLocations(data) {
  return extractList(data)
    .map((item) => {
      const id = String(item.id ?? item.locationId ?? "");
      const code = item.code || item.locationCode || buildLocationCode(item) || "";
      const name = item.name || item.locationName || "";
      const label = code || name || `Location #${id}`;

      return { id, code, name, label };
    })
    .filter((item) => item.id);
}

function extractWarehouseId(item) {
  const value =
    item?.warehouseId ??
    item?.warehouse?.id ??
    item?.location?.warehouseId ??
    item?.location?.warehouse?.id ??
    "";
  return value !== null && value !== undefined ? String(value) : "";
}

function mapRecentAssignments(data) {
  return extractList(data)
    .map((item) => ({
      id: String(item.id ?? `${item.productId || "p"}-${item.locationId || "l"}`),
      productId: String(item.productId ?? ""),
      locationId: String(item.locationId ?? ""),
      warehouseId: extractWarehouseId(item),
      product:
        item.productName ||
        item.productCode ||
        (item.productId ? `Product #${item.productId}` : "-"),
      location:
        item.locationCode ||
        item.locationLabel ||
        item.locationName ||
        (item.locationId ? `Location #${item.locationId}` : "-"),
      quantity: Number(item.quantity ?? 0),
      createdBy: item.createdBy || item.createdByName || "-",
      createdAt: item.createdAt || item.createdDate || null,
    }))
    .filter((item) => item.product !== "-" || item.location !== "-");
}

function formatHierarchyCode(rawValue, fallbackPrefix) {
  const value = String(rawValue || "").trim();
  if (!value) return `${fallbackPrefix}-`;

  const normalized = value.replace(/\s+/g, "");
  const codeLikeMatch = normalized.match(/[A-Za-z]{1,4}\d{1,4}/);
  if (codeLikeMatch) return codeLikeMatch[0].toUpperCase();

  const numericMatch = normalized.match(/\d+/);
  if (numericMatch) return `${fallbackPrefix}${numericMatch[0]}`;

  return `${fallbackPrefix}${normalized.charAt(0).toUpperCase()}`;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function Icon({ type }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "warehouse") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" />
        <path d="M9 21V12h6v9" />
      </svg>
    );
  }

  if (type === "inventory") {
    return (
      <svg {...common}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

export default function StockManagementPage() {
  const { role, user } = useAuth();
  const currentWarehouseId = String(user?.warehouseId ?? user?.warehouse?.id ?? "");
  const shouldScopeToUserWarehouse = role === "ADMIN";

  const [activeTab, setActiveTab] = useState("assign");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const [recentAssignments, setRecentAssignments] = useState([]);
  const [localRecentAssignments, setLocalRecentAssignments] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState("");

  const [warehouseBadge, setWarehouseBadge] = useState("Warehouse");
  const [currentUserLabel, setCurrentUserLabel] = useState("Current User");

  const [form, setForm] = useState({
    productId: "",
    quantity: 0,
  });

  const loadZones = async () => {
    try {
      const response = await api.get("/api/zones");
      const zoneList = Array.isArray(response.data) ? response.data : [];
      const scopedZones = shouldScopeToUserWarehouse
        ? currentWarehouseId
          ? zoneList.filter((zone) => {
            const zoneWarehouseId = String(zone?.warehouseId ?? zone?.warehouse?.id ?? "");
            return zoneWarehouseId === currentWarehouseId;
          })
          : []
        : zoneList;
      setZones(scopedZones);
    } catch (err) {
      console.error("Could not load zones:", err);
    }
  };

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

  const loadLocations = async (shelfId) => {
    if (!shelfId) {
      setLocations([]);
      setSelectedLocation("");
      return;
    }
    setLocationsLoading(true);
    try {
      const response = await api.get(`/api/locations/shelf/${shelfId}`);
      setLocations(normalizeLocations(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load locations.");
    } finally {
      setLocationsLoading(false);
    }
  };

  const loadRecentAssignments = async () => {
    setRecentLoading(true);
    setRecentError("");
    try {
      const response = await api.get("/api/stocks");
      const mappedAssignments = mapRecentAssignments(response.data);
      const scopedAssignments = shouldScopeToUserWarehouse
        ? currentWarehouseId
          ? mappedAssignments.filter((assignment) => {
            return assignment.warehouseId === currentWarehouseId;
          })
          : []
        : mappedAssignments;
      setRecentAssignments(scopedAssignments.slice(0, 8));
    } catch (requestError) {
      setRecentAssignments([]);
      setRecentError(requestError.response?.data?.message || "Could not load recent stock assignments.");
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
    loadRecentAssignments();
  }, [shouldScopeToUserWarehouse, currentWarehouseId]);

  useEffect(() => {
    try {
      const rawAuthUser = localStorage.getItem("auth_user");
      const authUser = rawAuthUser ? JSON.parse(rawAuthUser) : null;
      const warehouseLabel =
        authUser?.warehouseCode ||
        authUser?.warehouseName ||
        (authUser?.warehouseId ? `WH-${authUser.warehouseId}` : "Warehouse");
      const actorLabel =
        authUser?.name ||
        authUser?.fullName ||
        authUser?.username ||
        authUser?.email ||
        "Current User";
      setWarehouseBadge(warehouseLabel);
      setCurrentUserLabel(actorLabel);
    } catch {
      setWarehouseBadge("Warehouse");
      setCurrentUserLabel("Current User");
    }
  }, []);

  useEffect(() => {
    if (selectedZone) loadRacks(selectedZone);
  }, [selectedZone]);

  useEffect(() => {
    if (selectedRack) loadShelves(selectedRack);
  }, [selectedRack]);

  useEffect(() => {
    if (selectedShelf) loadLocations(selectedShelf);
  }, [selectedShelf]);

  const resetForm = () => {
    setForm({ productId: "", quantity: 0 });
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
      await api.post("/api/stocks", payload);

      const knownProductLabel =
        recentAssignments.find((item) => String(item.productId) === String(form.productId))?.product ||
        `Product #${form.productId}`;

      setLocalRecentAssignments((prev) => [
        {
          id: `local-${Date.now()}`,
          productId: String(form.productId),
          locationId: String(selectedLocation),
          product: knownProductLabel,
          location: selectedLocationName || locationPreview,
          quantity: Number(form.quantity),
          createdBy: currentUserLabel,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 8));

      resetForm();
      loadRecentAssignments();
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

  const selectedZoneName = zones.find((zone) => String(zone.id) === String(selectedZone))?.name || "";
  const selectedRackCode =
    racks.find((rack) => String(rack.id) === String(selectedRack))?.code ||
    racks.find((rack) => String(rack.id) === String(selectedRack))?.name ||
    "";
  const selectedShelfCode =
    shelves.find((shelf) => String(shelf.id) === String(selectedShelf))?.code ||
    shelves.find((shelf) => String(shelf.id) === String(selectedShelf))?.level ||
    "";
  const selectedLocationName =
    locations.find((location) => String(location.id) === String(selectedLocation))?.label || "";

  const locationPreview = useMemo(
    () =>
      `${formatHierarchyCode(selectedZoneName, "Z")} / ${formatHierarchyCode(selectedRackCode, "R")} / ${formatHierarchyCode(selectedShelfCode, "C")} / ${formatHierarchyCode(selectedLocationName, "L")}`,
    [selectedZoneName, selectedRackCode, selectedShelfCode, selectedLocationName]
  );

  const mergedRecentAssignments = useMemo(
    () => [...localRecentAssignments, ...recentAssignments].slice(0, 8),
    [localRecentAssignments, recentAssignments]
  );

  const rackHint = !selectedZone
    ? "Select a zone to unlock racks."
    : racksLoading
      ? "Loading racks..."
      : "Choose a rack in the selected zone.";

  const shelfHint = !selectedRack
    ? "Select a rack to unlock shelves."
    : shelvesLoading
      ? "Loading shelves..."
      : "Choose a shelf from the selected rack.";

  const locationHint = !selectedShelf
    ? "Select a shelf to unlock locations."
    : locationsLoading
      ? "Loading locations..."
      : "Choose a final location for stock assignment.";

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>Stocks</h1>
          <p className={styles.subtitle}>Manage warehouse stock allocation and inventory locations.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.warehouseBadge}>
            <span className={styles.badgeIcon}><Icon type="warehouse" /></span>
            {warehouseBadge}
          </span>
          <Button
            type="button"
            fullWidth={false}
            variant="primary"
            onClick={() => setActiveTab((current) => (current === "assign" ? "search" : "assign"))}
          >
            <Icon type="inventory" />
            {activeTab === "assign" ? "View Inventory" : "Back to Assignment"}
          </Button>
        </div>
      </header>

      {activeTab === "assign" ? (
        <>
          <div className={styles.assignmentGrid}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Location Hierarchy</h2>
                <p>Select zone, rack, shelf, and location in sequence.</p>
              </div>

              <div className={styles.flow}>
                <div className={styles.stepRow}>
                  <span className={styles.step}>1</span>
                  <div className={styles.field}>
                    <label>Zone</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => handleZoneChange(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Choose zone</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                    <p className={styles.hint}>Start with the warehouse zone.</p>
                  </div>
                </div>

                <div className={styles.stepRow}>
                  <span className={styles.step}>2</span>
                  <div className={styles.field}>
                    <label>Rack</label>
                    <select
                      value={selectedRack}
                      onChange={(e) => handleRackChange(e.target.value)}
                      className={styles.select}
                      disabled={!selectedZone || racksLoading}
                    >
                      <option value="">Choose rack</option>
                      {racks.map((rack) => (
                        <option key={rack.id} value={rack.id}>
                          {rack.code || rack.name || `Rack #${rack.id}`}
                        </option>
                      ))}
                    </select>
                    <p className={styles.hint}>{rackHint}</p>
                  </div>
                </div>

                <div className={styles.stepRow}>
                  <span className={styles.step}>3</span>
                  <div className={styles.field}>
                    <label>Shelf</label>
                    <select
                      value={selectedShelf}
                      onChange={(e) => handleShelfChange(e.target.value)}
                      className={styles.select}
                      disabled={!selectedRack || shelvesLoading}
                    >
                      <option value="">Choose shelf</option>
                      {shelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.code || shelf.level || `Shelf #${shelf.id}`}
                        </option>
                      ))}
                    </select>
                    <p className={styles.hint}>{shelfHint}</p>
                  </div>
                </div>

                <div className={styles.stepRow}>
                  <span className={styles.step}>4</span>
                  <div className={styles.field}>
                    <label>Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className={styles.select}
                      disabled={!selectedShelf || locationsLoading}
                    >
                      <option value="">Choose location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.label}
                        </option>
                      ))}
                    </select>
                    <p className={styles.hint}>{locationHint}</p>
                  </div>
                </div>
              </div>
            </section>

            <StockForm
              className={styles.card}
              title="Assign Product Stock"
              form={form}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              isEditing={false}
              isSubmitting={saving}
              disableSubmit={!selectedLocation}
              error={formError}
              locationId={selectedLocation}
              locationName={selectedLocationName}
              locationPreview={locationPreview}
              locationReady={Boolean(selectedLocation)}
            />
          </div>

          {error ? <p className={styles.errorBanner}>{error}</p> : null}

          <section className={`${styles.card} ${styles.tableCard}`}>
            <div className={styles.cardHeader}>
              <h2>Recent Stock Assignments</h2>
              <p>Latest stock allocations in this warehouse.</p>
            </div>

            {recentLoading ? <p className={styles.tableInfo}>Loading recent assignments...</p> : null}
            {!recentLoading && recentError ? <p className={styles.errorInline}>{recentError}</p> : null}

            {!recentLoading && !recentError && !mergedRecentAssignments.length ? (
              <p className={styles.tableInfo}>No assignments found yet.</p>
            ) : null}

            {!recentLoading && mergedRecentAssignments.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Location</th>
                      <th>Quantity</th>
                      <th>Created By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergedRecentAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>{assignment.product}</td>
                        <td>{assignment.location}</td>
                        <td>
                          <span className={styles.qty}>{assignment.quantity}</span>
                        </td>
                        <td>{assignment.createdBy || "-"}</td>
                        <td>{formatDateTime(assignment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <StockSearchPage embedded />
      )}
    </section>
  );
}
