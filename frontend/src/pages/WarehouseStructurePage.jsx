import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./WarehouseStructurePage.module.css";

function normalizeZones(data) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list
    .map((item) => ({
      id: String(item.id),
      name: item.name || `Zone #${item.id}`,
      warehouseId: String(item.warehouseId ?? item.warehouse?.id ?? ""),
      warehouseName: item.warehouse?.name || item.warehouseName || "Warehouse",
    }))
    .filter((item) => item.id);
}

function normalizeRacks(data, zone) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list
    .map((item) => ({
      id: String(item.id),
      code: item.code || `Rack #${item.id}`,
      zoneId: String(zone.id),
      zoneName: zone.name,
    }))
    .filter((item) => item.id);
}

function normalizeShelves(data, rack) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list
    .map((item) => ({
      id: String(item.id),
      code: item.code || item.name || `Shelf #${item.id}`,
      rackId: String(rack.id),
      rackCode: rack.code,
      zoneId: String(rack.zoneId),
      zoneName: rack.zoneName,
    }))
    .filter((item) => item.id);
}

function normalizeLocations(data, shelf) {
  const list = Array.isArray(data) ? data : data?.data || [];
  return list
    .map((item) => {
      const id = String(item.id ?? item.locationId ?? "");
      const code = item.code || item.name || item.locationName || `LOC-${id}`;

      return {
        id,
        code,
        shelfId: String(shelf.id),
        shelfCode: shelf.code,
        rackId: String(shelf.rackId),
        rackCode: item.rack || shelf.rackCode,
        zoneId: String(shelf.zoneId),
        zoneName: item.zone || shelf.zoneName,
      };
    })
    .filter((item) => item.id);
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

  if (type === "zone") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (type === "rack") {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M4 9h16M4 15h16" />
      </svg>
    );
  }

  if (type === "shelf") {
    return (
      <svg {...common}>
        <path d="M5 4h14M5 10h14M5 16h14M5 22h14" />
        <path d="M7 4v18M17 4v18" />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg {...common}>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  if (type === "delete") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    );
  }

  if (type === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (type === "chevron-down") {
    return (
      <svg {...common}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function countLabel(count, label) {
  return `${count} ${label}`;
}

export default function WarehouseStructurePage() {
  const { user, role } = useAuth();
  const currentWarehouseId = user?.warehouseId || user?.warehouse?.id || "";
  const shouldScopeToUserWarehouse = role === "ADMIN";

  const [warehouseBadge, setWarehouseBadge] = useState("Warehouse");
  const [zones, setZones] = useState([]);
  const [racksByZone, setRacksByZone] = useState({});
  const [shelvesByRack, setShelvesByRack] = useState({});
  const [locationsByShelf, setLocationsByShelf] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingTab, setSavingTab] = useState("");
  const [deletingKey, setDeletingKey] = useState("");

  const [activeTab, setActiveTab] = useState("zones");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedRackId, setSelectedRackId] = useState("");
  const [selectedShelfId, setSelectedShelfId] = useState("");
  const [selectedNodeKey, setSelectedNodeKey] = useState("");

  const [expandedMap, setExpandedMap] = useState({});

  const [editingZoneId, setEditingZoneId] = useState("");
  const [editingRackId, setEditingRackId] = useState("");
  const [editingShelfId, setEditingShelfId] = useState("");
  const [editingLocationId, setEditingLocationId] = useState("");

  const [zoneForm, setZoneForm] = useState({ name: "" });
  const [rackForm, setRackForm] = useState({ code: "", zoneId: "" });
  const [shelfForm, setShelfForm] = useState({ code: "", rackId: "" });
  const [locationForm, setLocationForm] = useState({ code: "", shelfId: "" });

  const [formErrors, setFormErrors] = useState({
    zones: "",
    racks: "",
    shelves: "",
    locations: "",
  });

  const racks = useMemo(() => Object.values(racksByZone).flat(), [racksByZone]);
  const shelves = useMemo(() => Object.values(shelvesByRack).flat(), [shelvesByRack]);
  const locations = useMemo(() => Object.values(locationsByShelf).flat(), [locationsByShelf]);

  const zoneMap = useMemo(
    () => new Map(zones.map((zone) => [String(zone.id), zone])),
    [zones]
  );
  const rackMap = useMemo(
    () => new Map(racks.map((rack) => [String(rack.id), rack])),
    [racks]
  );
  const shelfMap = useMemo(
    () => new Map(shelves.map((shelf) => [String(shelf.id), shelf])),
    [shelves]
  );

  const loadStructure = async () => {
    setLoading(true);
    setError("");
    try {
      const zonesResponse = await api.get("/api/zones");
      const normalizedZones = normalizeZones(zonesResponse.data);
      const visibleZones = shouldScopeToUserWarehouse
        ? currentWarehouseId
          ? normalizedZones.filter((zone) => {
            return String(zone.warehouseId) === String(currentWarehouseId);
          })
          : []
        : normalizedZones;
      setZones(visibleZones);

      const rackEntries = await Promise.all(
        visibleZones.map(async (zone) => {
          try {
            const response = await api.get(`/api/racks?zoneId=${zone.id}`);
            return [String(zone.id), normalizeRacks(response.data, zone)];
          } catch {
            return [String(zone.id), []];
          }
        })
      );
      const rackMapByZone = Object.fromEntries(rackEntries);
      setRacksByZone(rackMapByZone);

      const allRacks = Object.values(rackMapByZone).flat();
      const shelfEntries = await Promise.all(
        allRacks.map(async (rack) => {
          try {
            const response = await api.get(`/api/shelves?rackId=${rack.id}`);
            return [String(rack.id), normalizeShelves(response.data, rack)];
          } catch {
            return [String(rack.id), []];
          }
        })
      );
      const shelfMapByRack = Object.fromEntries(shelfEntries);
      setShelvesByRack(shelfMapByRack);

      const allShelves = Object.values(shelfMapByRack).flat();
      const locationEntries = await Promise.all(
        allShelves.map(async (shelf) => {
          try {
            const response = await api.get(`/api/locations/shelf/${shelf.id}`);
            return [String(shelf.id), normalizeLocations(response.data, shelf)];
          } catch {
            return [String(shelf.id), []];
          }
        })
      );
      const locationMapByShelf = Object.fromEntries(locationEntries);
      setLocationsByShelf(locationMapByShelf);

      const firstZone = visibleZones[0]?.id || "";
      setSelectedZoneId((prev) => {
        const keep = prev && visibleZones.some((zone) => String(zone.id) === String(prev));
        return keep ? prev : String(firstZone || "");
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load warehouse structure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStructure();
  }, [shouldScopeToUserWarehouse, currentWarehouseId]);

  useEffect(() => {
    try {
      const rawAuthUser = localStorage.getItem("auth_user");
      const authUser = rawAuthUser ? JSON.parse(rawAuthUser) : null;
      const label =
        authUser?.warehouseCode ||
        authUser?.warehouseName ||
        (authUser?.warehouseId ? `WH-${authUser.warehouseId}` : "Warehouse");
      setWarehouseBadge(label);
    } catch {
      setWarehouseBadge("Warehouse");
    }
  }, []);

  useEffect(() => {
    if (!selectedZoneId) {
      setSelectedRackId("");
      return;
    }
    const zoneRacks = racksByZone[String(selectedZoneId)] || [];
    if (!zoneRacks.some((rack) => String(rack.id) === String(selectedRackId))) {
      setSelectedRackId(zoneRacks[0]?.id || "");
    }
  }, [selectedZoneId, racksByZone, selectedRackId]);

  useEffect(() => {
    if (!selectedRackId) {
      setSelectedShelfId("");
      return;
    }
    const rackShelves = shelvesByRack[String(selectedRackId)] || [];
    if (!rackShelves.some((shelf) => String(shelf.id) === String(selectedShelfId))) {
      setSelectedShelfId(rackShelves[0]?.id || "");
    }
  }, [selectedRackId, shelvesByRack, selectedShelfId]);

  useEffect(() => {
    if (!editingRackId) {
      setRackForm((prev) => ({ ...prev, zoneId: String(selectedZoneId || "") }));
    }
  }, [selectedZoneId, editingRackId]);

  useEffect(() => {
    if (!editingShelfId) {
      setShelfForm((prev) => ({ ...prev, rackId: String(selectedRackId || "") }));
    }
  }, [selectedRackId, editingShelfId]);

  useEffect(() => {
    if (!editingLocationId) {
      setLocationForm((prev) => ({ ...prev, shelfId: String(selectedShelfId || "") }));
    }
  }, [selectedShelfId, editingLocationId]);

  const visibleRacks = useMemo(() => {
    if (!selectedZoneId) return racks;
    return racksByZone[String(selectedZoneId)] || [];
  }, [racks, racksByZone, selectedZoneId]);

  const visibleShelves = useMemo(() => {
    if (selectedRackId) return shelvesByRack[String(selectedRackId)] || [];
    if (selectedZoneId) {
      return shelves.filter((item) => String(item.zoneId) === String(selectedZoneId));
    }
    return shelves;
  }, [selectedRackId, selectedZoneId, shelvesByRack, shelves]);

  const visibleLocations = useMemo(() => {
    if (selectedShelfId) return locationsByShelf[String(selectedShelfId)] || [];
    if (selectedRackId) {
      return locations.filter((item) => String(item.rackId) === String(selectedRackId));
    }
    if (selectedZoneId) {
      return locations.filter((item) => String(item.zoneId) === String(selectedZoneId));
    }
    return locations;
  }, [selectedShelfId, selectedRackId, selectedZoneId, locationsByShelf, locations]);

  const treeZones = useMemo(() => {
    return zones.map((zone) => {
      const zoneRacks = racksByZone[String(zone.id)] || [];
      return {
        ...zone,
        racks: zoneRacks.map((rack) => {
          const rackShelves = shelvesByRack[String(rack.id)] || [];
          return {
            ...rack,
            shelves: rackShelves.map((shelf) => ({
              ...shelf,
              locations: locationsByShelf[String(shelf.id)] || [],
            })),
          };
        }),
      };
    });
  }, [zones, racksByZone, shelvesByRack, locationsByShelf]);

  const summaryCounts = useMemo(() => ({
    zones: zones.length,
    racks: racks.length,
    shelves: shelves.length,
    locations: locations.length,
  }), [zones.length, racks.length, shelves.length, locations.length]);

  const resetFormState = (tab) => {
    if (tab === "zones") {
      setEditingZoneId("");
      setZoneForm({ name: "" });
      setFormErrors((prev) => ({ ...prev, zones: "" }));
      return;
    }
    if (tab === "racks") {
      setEditingRackId("");
      setRackForm({ code: "", zoneId: String(selectedZoneId || "") });
      setFormErrors((prev) => ({ ...prev, racks: "" }));
      return;
    }
    if (tab === "shelves") {
      setEditingShelfId("");
      setShelfForm({ code: "", rackId: String(selectedRackId || "") });
      setFormErrors((prev) => ({ ...prev, shelves: "" }));
      return;
    }
    setEditingLocationId("");
    setLocationForm({ code: "", shelfId: String(selectedShelfId || "") });
    setFormErrors((prev) => ({ ...prev, locations: "" }));
  };

  const onAddStructure = () => {
    let targetTab = "zones";
    if (selectedNodeKey.startsWith("zone:")) targetTab = "racks";
    else if (selectedNodeKey.startsWith("rack:")) targetTab = "shelves";
    else if (selectedNodeKey.startsWith("shelf:")) targetTab = "locations";

    setActiveTab(targetTab);

    setEditingZoneId("");
    setEditingRackId("");
    setEditingShelfId("");
    setEditingLocationId("");
    resetFormState(targetTab);
  };

  const startEditZone = (zone) => {
    setActiveTab("zones");
    setSelectedNodeKey(`zone:${zone.id}`);
    setSelectedZoneId(String(zone.id));
    setEditingZoneId(String(zone.id));
    setZoneForm({ name: zone.name || "" });
    setFormErrors((prev) => ({ ...prev, zones: "" }));
  };

  const startEditRack = (rack) => {
    setActiveTab("racks");
    setSelectedNodeKey(`rack:${rack.id}`);
    setSelectedZoneId(String(rack.zoneId));
    setSelectedRackId(String(rack.id));
    setEditingRackId(String(rack.id));
    setRackForm({
      code: rack.code || "",
      zoneId: String(rack.zoneId || ""),
    });
    setFormErrors((prev) => ({ ...prev, racks: "" }));
  };

  const startEditShelf = (shelf) => {
    setActiveTab("shelves");
    setSelectedNodeKey(`shelf:${shelf.id}`);
    setSelectedZoneId(String(shelf.zoneId));
    setSelectedRackId(String(shelf.rackId));
    setSelectedShelfId(String(shelf.id));
    setEditingShelfId(String(shelf.id));
    setShelfForm({
      code: shelf.code || "",
      rackId: String(shelf.rackId || ""),
    });
    setFormErrors((prev) => ({ ...prev, shelves: "" }));
  };

  const startEditLocation = (location) => {
    setActiveTab("locations");
    setSelectedNodeKey(`location:${location.id}`);
    setSelectedZoneId(String(location.zoneId));
    setSelectedRackId(String(location.rackId));
    setSelectedShelfId(String(location.shelfId));
    setEditingLocationId(String(location.id));
    setLocationForm({
      code: location.code || "",
      shelfId: String(location.shelfId || ""),
    });
    setFormErrors((prev) => ({ ...prev, locations: "" }));
  };

  const deleteEntity = async (type, entity) => {
    const names = {
      zone: entity.name,
      rack: entity.code,
      shelf: entity.code,
      location: entity.code,
    };
    const confirmed = window.confirm(`Delete ${type} ${names[type] || ""}?`);
    if (!confirmed) return;

    setDeletingKey(`${type}:${entity.id}`);
    setError("");
    try {
      if (type === "zone") {
        await api.delete(`/api/zones/${entity.id}`);
      } else if (type === "rack") {
        await api.delete(`/api/racks/${entity.id}`);
      } else if (type === "shelf") {
        await api.delete(`/api/shelves/${entity.id}`);
      } else {
        await api.delete(`/api/locations/${entity.id}`);
      }

      if (type === "zone") setEditingZoneId("");
      if (type === "rack") setEditingRackId("");
      if (type === "shelf") setEditingShelfId("");
      if (type === "location") setEditingLocationId("");
      await loadStructure();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Could not delete ${type}.`);
    } finally {
      setDeletingKey("");
    }
  };

  const handleZoneSubmit = async (event) => {
    event.preventDefault();
    setSavingTab("zones");
    setFormErrors((prev) => ({ ...prev, zones: "" }));

    if (!zoneForm.name.trim()) {
      setFormErrors((prev) => ({ ...prev, zones: "Zone name is required." }));
      setSavingTab("");
      return;
    }

    try {
      if (editingZoneId) {
        await api.put(`/api/zones/${editingZoneId}`, { name: zoneForm.name.trim() });
      } else {
        await api.post("/api/zones", { name: zoneForm.name.trim() });
      }
      resetFormState("zones");
      await loadStructure();
    } catch (requestError) {
      setFormErrors((prev) => ({ ...prev, zones: requestError.response?.data?.message || "Could not save zone." }));
    } finally {
      setSavingTab("");
    }
  };

  const handleRackSubmit = async (event) => {
    event.preventDefault();
    setSavingTab("racks");
    setFormErrors((prev) => ({ ...prev, racks: "" }));

    if (!rackForm.code.trim() || !rackForm.zoneId) {
      setFormErrors((prev) => ({ ...prev, racks: "Rack code and zone are required." }));
      setSavingTab("");
      return;
    }

    const payload = {
      code: rackForm.code.trim(),
      zoneId: Number(rackForm.zoneId),
    };

    try {
      if (editingRackId) {
        await api.put(`/api/racks/${editingRackId}`, payload);
      } else {
        await api.post("/api/racks", payload);
      }
      resetFormState("racks");
      await loadStructure();
    } catch (requestError) {
      setFormErrors((prev) => ({ ...prev, racks: requestError.response?.data?.message || "Could not save rack." }));
    } finally {
      setSavingTab("");
    }
  };

  const handleShelfSubmit = async (event) => {
    event.preventDefault();
    setSavingTab("shelves");
    setFormErrors((prev) => ({ ...prev, shelves: "" }));

    if (!shelfForm.code.trim() || !shelfForm.rackId) {
      setFormErrors((prev) => ({ ...prev, shelves: "Shelf code and rack are required." }));
      setSavingTab("");
      return;
    }

    const payload = {
      code: shelfForm.code.trim(),
      rackId: Number(shelfForm.rackId),
    };

    try {
      if (editingShelfId) {
        await api.put(`/api/shelves/${editingShelfId}`, payload);
      } else {
        await api.post("/api/shelves", payload);
      }
      resetFormState("shelves");
      await loadStructure();
    } catch (requestError) {
      setFormErrors((prev) => ({ ...prev, shelves: requestError.response?.data?.message || "Could not save shelf." }));
    } finally {
      setSavingTab("");
    }
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    setSavingTab("locations");
    setFormErrors((prev) => ({ ...prev, locations: "" }));

    if (!locationForm.code.trim() || !locationForm.shelfId) {
      setFormErrors((prev) => ({ ...prev, locations: "Location code and shelf are required." }));
      setSavingTab("");
      return;
    }

    const payload = {
      name: locationForm.code.trim(),
      shelfId: Number(locationForm.shelfId),
      warehouseId: Number(currentWarehouseId),
    };

    try {
      if (editingLocationId) {
        await api.put(`/api/locations/${editingLocationId}`, payload);
      } else {
        await api.post("/api/locations", payload);
      }
      resetFormState("locations");
      await loadStructure();
    } catch (requestError) {
      setFormErrors((prev) => ({ ...prev, locations: requestError.response?.data?.message || "Could not save location." }));
    } finally {
      setSavingTab("");
    }
  };

  const toggleNode = (key) => {
    setExpandedMap((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));
  };

  const renderNodeActions = (type, entity) => {
    if (type === "warehouse") {
      return (
        <div className={styles.nodeActions}>
          <button type="button" className={styles.iconBtn} disabled title="Not available">
            <Icon type="edit" />
          </button>
          <button type="button" className={styles.iconBtn} disabled title="Not available">
            <Icon type="delete" />
          </button>
        </div>
      );
    }

    const onEdit = () => {
      if (type === "zone") startEditZone(entity);
      if (type === "rack") startEditRack(entity);
      if (type === "shelf") startEditShelf(entity);
      if (type === "location") startEditLocation(entity);
    };

    return (
      <div className={styles.nodeActions}>
        <button type="button" className={styles.iconBtn} onClick={onEdit} title={`Edit ${type}`}>
          <Icon type="edit" />
        </button>
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.dangerIconBtn}`}
          onClick={() => deleteEntity(type, entity)}
          disabled={deletingKey === `${type}:${entity.id}`}
          title={`Delete ${type}`}
        >
          <Icon type="delete" />
        </button>
      </div>
    );
  };

  const renderTree = () => {
    if (loading) {
      return <p className={styles.info}>Loading warehouse hierarchy...</p>;
    }

    if (!zones.length) {
      return <p className={styles.info}>No zones found.</p>;
    }

    return (
      <div className={styles.treeList}>
        {treeZones.map((zone) => {
          const zoneKey = `zone:${zone.id}`;
          const zoneExpanded = expandedMap[zoneKey] ?? true;
          return (
            <div key={zoneKey} className={styles.treeNode}>
              <div className={`${styles.nodeRow} ${selectedNodeKey === zoneKey ? styles.nodeSelected : ""}`}>
                <button type="button" className={styles.expandBtn} onClick={() => toggleNode(zoneKey)}>
                  <Icon type={zoneExpanded ? "chevron-down" : "chevron-right"} />
                </button>
                <span className={styles.nodeIcon}><Icon type="zone" /></span>
                <button
                  type="button"
                  className={styles.nodeLabel}
                  onClick={() => {
                    setSelectedNodeKey(zoneKey);
                    setSelectedZoneId(String(zone.id));
                    setActiveTab("zones");
                    startEditZone(zone);
                  }}
                >
                  {zone.name}
                </button>
                <span className={styles.countChip}>{countLabel(zone.racks.length, "racks")}</span>
                {renderNodeActions("zone", zone)}
              </div>

              {zoneExpanded ? (
                <div className={styles.children}>
                  {zone.racks.map((rack) => {
                    const rackKey = `rack:${rack.id}`;
                    const rackExpanded = expandedMap[rackKey] ?? false;
                    return (
                      <div key={rackKey} className={styles.treeNode}>
                        <div className={`${styles.nodeRow} ${selectedNodeKey === rackKey ? styles.nodeSelected : ""}`}>
                          <button type="button" className={styles.expandBtn} onClick={() => toggleNode(rackKey)}>
                            <Icon type={rackExpanded ? "chevron-down" : "chevron-right"} />
                          </button>
                          <span className={styles.nodeIcon}><Icon type="rack" /></span>
                          <button
                            type="button"
                            className={styles.nodeLabel}
                            onClick={() => {
                              setSelectedNodeKey(rackKey);
                              setSelectedZoneId(String(rack.zoneId));
                              setSelectedRackId(String(rack.id));
                              setActiveTab("racks");
                              startEditRack(rack);
                            }}
                          >
                            {rack.code}
                          </button>
                          <span className={styles.countChip}>{countLabel(rack.shelves.length, "shelves")}</span>
                          {renderNodeActions("rack", rack)}
                        </div>

                        {rackExpanded ? (
                          <div className={styles.children}>
                            {rack.shelves.map((shelf) => {
                              const shelfKey = `shelf:${shelf.id}`;
                              const shelfExpanded = expandedMap[shelfKey] ?? false;
                              return (
                                <div key={shelfKey} className={styles.treeNode}>
                                  <div className={`${styles.nodeRow} ${selectedNodeKey === shelfKey ? styles.nodeSelected : ""}`}>
                                    <button type="button" className={styles.expandBtn} onClick={() => toggleNode(shelfKey)}>
                                      <Icon type={shelfExpanded ? "chevron-down" : "chevron-right"} />
                                    </button>
                                    <span className={styles.nodeIcon}><Icon type="shelf" /></span>
                                    <button
                                      type="button"
                                      className={styles.nodeLabel}
                                      onClick={() => {
                                        setSelectedNodeKey(shelfKey);
                                        setSelectedZoneId(String(shelf.zoneId));
                                        setSelectedRackId(String(shelf.rackId));
                                        setSelectedShelfId(String(shelf.id));
                                        setActiveTab("shelves");
                                        startEditShelf(shelf);
                                      }}
                                    >
                                      {shelf.code}
                                    </button>
                                    <span className={styles.countChip}>
                                      {countLabel(shelf.locations.length, "locations")}
                                    </span>
                                    {renderNodeActions("shelf", shelf)}
                                  </div>

                                  {shelfExpanded ? (
                                    <div className={styles.children}>
                                      {shelf.locations.map((location) => {
                                        const locationKey = `location:${location.id}`;
                                        return (
                                          <div key={locationKey} className={`${styles.nodeRow} ${selectedNodeKey === locationKey ? styles.nodeSelected : ""}`}>
                                            <span className={styles.expandBtn} />
                                            <span className={styles.nodeIcon}><Icon type="location" /></span>
                                            <button
                                              type="button"
                                              className={styles.nodeLabel}
                                              onClick={() => {
                                                setSelectedNodeKey(locationKey);
                                                setSelectedZoneId(String(location.zoneId));
                                                setSelectedRackId(String(location.rackId));
                                                setSelectedShelfId(String(location.shelfId));
                                                setActiveTab("locations");
                                                startEditLocation(location);
                                              }}
                                            >
                                              {location.code}
                                            </button>
                                            <span className={styles.countChip}>{countLabel(0, "children")}</span>
                                            {renderNodeActions("location", location)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  const tabs = [
    { id: "zones", label: "Zones" },
    { id: "racks", label: "Racks" },
    { id: "shelves", label: "Shelves" },
    { id: "locations", label: "Locations" },
  ];

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Warehouse Structure</h1>
          <p className={styles.subtitle}>Manage zones, racks, shelves, and storage locations in one place.</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.warehouseBadge}>
            <Icon type="warehouse" />
            {warehouseBadge}
          </span>
          <button type="button" className={styles.addButton} onClick={onAddStructure}>
            <Icon type="plus" />
            Add Structure
          </button>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.mainGrid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Warehouse Hierarchy</h2>
            <p>
              {summaryCounts.zones} zones · {summaryCounts.racks} racks · {summaryCounts.shelves} shelves · {summaryCounts.locations} locations
            </p>
          </div>
          {renderTree()}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>Structure Management</h2>
            <p>Use tabs to create, edit, and review each hierarchy level.</p>
          </div>

          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "zones" ? (
            <div className={styles.tabPanel}>
              <form className={styles.formGrid} onSubmit={handleZoneSubmit}>
                <div className={styles.field}>
                  <label>Zone Name</label>
                  <input
                    value={zoneForm.name}
                    onChange={(event) => setZoneForm({ name: event.target.value })}
                    placeholder="Enter zone name"
                    required
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={savingTab === "zones"}>
                    {savingTab === "zones" ? "Saving..." : editingZoneId ? "Update Zone" : "Create Zone"}
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={() => resetFormState("zones")}>
                    Reset
                  </button>
                </div>
              </form>
              {formErrors.zones ? <p className={styles.inlineError}>{formErrors.zones}</p> : null}

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Zone Name</th>
                      <th>Warehouse</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id}>
                        <td>{zone.name}</td>
                        <td>{zone.warehouseName}</td>
                        <td className={styles.actionCol}>
                          <button type="button" className={styles.smallBtn} onClick={() => startEditZone(zone)}>
                            <Icon type="edit" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.smallBtn} ${styles.smallDangerBtn}`}
                            onClick={() => deleteEntity("zone", zone)}
                            disabled={deletingKey === `zone:${zone.id}`}
                          >
                            <Icon type="delete" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "racks" ? (
            <div className={styles.tabPanel}>
              <form className={styles.formGrid} onSubmit={handleRackSubmit}>
                <div className={styles.field}>
                  <label>Rack Code</label>
                  <input
                    value={rackForm.code}
                    onChange={(event) => setRackForm((prev) => ({ ...prev, code: event.target.value }))}
                    placeholder="Enter rack code"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Zone</label>
                  <select
                    value={rackForm.zoneId}
                    onChange={(event) => setRackForm((prev) => ({ ...prev, zoneId: event.target.value }))}
                    required
                  >
                    <option value="">Select zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={savingTab === "racks"}>
                    {savingTab === "racks" ? "Saving..." : editingRackId ? "Update Rack" : "Create Rack"}
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={() => resetFormState("racks")}>
                    Reset
                  </button>
                </div>
              </form>
              {formErrors.racks ? <p className={styles.inlineError}>{formErrors.racks}</p> : null}

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rack Code</th>
                      <th>Zone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRacks.map((rack) => (
                      <tr key={rack.id}>
                        <td>{rack.code}</td>
                        <td>{rack.zoneName}</td>
                        <td className={styles.actionCol}>
                          <button type="button" className={styles.smallBtn} onClick={() => startEditRack(rack)}>
                            <Icon type="edit" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.smallBtn} ${styles.smallDangerBtn}`}
                            onClick={() => deleteEntity("rack", rack)}
                            disabled={deletingKey === `rack:${rack.id}`}
                          >
                            <Icon type="delete" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "shelves" ? (
            <div className={styles.tabPanel}>
              <form className={styles.formGrid} onSubmit={handleShelfSubmit}>
                <div className={styles.field}>
                  <label>Shelf Code</label>
                  <input
                    value={shelfForm.code}
                    onChange={(event) => setShelfForm((prev) => ({ ...prev, code: event.target.value }))}
                    placeholder="Enter shelf code"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Rack</label>
                  <select
                    value={shelfForm.rackId}
                    onChange={(event) => setShelfForm((prev) => ({ ...prev, rackId: event.target.value }))}
                    required
                  >
                    <option value="">Select rack</option>
                    {racks.map((rack) => (
                      <option key={rack.id} value={rack.id}>
                        {rack.code} · {rack.zoneName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={savingTab === "shelves"}>
                    {savingTab === "shelves" ? "Saving..." : editingShelfId ? "Update Shelf" : "Create Shelf"}
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={() => resetFormState("shelves")}>
                    Reset
                  </button>
                </div>
              </form>
              {formErrors.shelves ? <p className={styles.inlineError}>{formErrors.shelves}</p> : null}

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Shelf Code</th>
                      <th>Rack</th>
                      <th>Zone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleShelves.map((shelf) => (
                      <tr key={shelf.id}>
                        <td>{shelf.code}</td>
                        <td>{shelf.rackCode}</td>
                        <td>{shelf.zoneName}</td>
                        <td className={styles.actionCol}>
                          <button type="button" className={styles.smallBtn} onClick={() => startEditShelf(shelf)}>
                            <Icon type="edit" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.smallBtn} ${styles.smallDangerBtn}`}
                            onClick={() => deleteEntity("shelf", shelf)}
                            disabled={deletingKey === `shelf:${shelf.id}`}
                          >
                            <Icon type="delete" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "locations" ? (
            <div className={styles.tabPanel}>
              <form className={styles.formGrid} onSubmit={handleLocationSubmit}>
                <div className={styles.field}>
                  <label>Location Code</label>
                  <input
                    value={locationForm.code}
                    onChange={(event) => setLocationForm((prev) => ({ ...prev, code: event.target.value }))}
                    placeholder="Enter location code"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Shelf</label>
                  <select
                    value={locationForm.shelfId}
                    onChange={(event) => setLocationForm((prev) => ({ ...prev, shelfId: event.target.value }))}
                    required
                  >
                    <option value="">Select shelf</option>
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.code} · {shelf.rackCode} · {shelf.zoneName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={savingTab === "locations"}>
                    {savingTab === "locations" ? "Saving..." : editingLocationId ? "Update Location" : "Create Location"}
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={() => resetFormState("locations")}>
                    Reset
                  </button>
                </div>
              </form>
              {formErrors.locations ? <p className={styles.inlineError}>{formErrors.locations}</p> : null}

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Location Code</th>
                      <th>Shelf</th>
                      <th>Rack</th>
                      <th>Zone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLocations.map((location) => (
                      <tr key={location.id}>
                        <td>{location.code}</td>
                        <td>{location.shelfCode}</td>
                        <td>{location.rackCode}</td>
                        <td>{location.zoneName}</td>
                        <td className={styles.actionCol}>
                          <button type="button" className={styles.smallBtn} onClick={() => startEditLocation(location)}>
                            <Icon type="edit" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.smallBtn} ${styles.smallDangerBtn}`}
                            onClick={() => deleteEntity("location", location)}
                            disabled={deletingKey === `location:${location.id}`}
                          >
                            <Icon type="delete" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
