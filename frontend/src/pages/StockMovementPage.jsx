import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./StockMovementPage.module.css";

const movementTypes = ["IN", "OUT", "TRANSFER"];
const destinationTypes = ["WAREHOUSE", "CUSTOMER", "SUPPLIER"];
const reasonByMovementType = {
  IN: ["SUPPLIER_RECEIPT", "CUSTOMER_RETURN", "INCOMING_TRANSFER"],
  OUT: ["CUSTOMER_SHIPMENT", "SUPPLIER_RETURN", "OUTGOING_TRANSFER"],
  TRANSFER: ["INTERNAL_TRANSFER"],
};
const forcedDestinationTypeByReason = {
  SUPPLIER_RECEIPT: "SUPPLIER",
  CUSTOMER_RETURN: "CUSTOMER",
  INCOMING_TRANSFER: "WAREHOUSE",
  OUTGOING_TRANSFER: "WAREHOUSE",
  SUPPLIER_RETURN: "SUPPLIER",
  CUSTOMER_SHIPMENT: "CUSTOMER",
};

const initialForm = {
  productId: "",
  fromLocationId: "",
  toLocationId: "",
  quantity: "",
  movementType: "",
  movementReason: "",
  destinationType: "WAREHOUSE",
  destinationId: "",
  notes: "",
};

const initialFilters = {
  product: "",
  movementType: "",
  createdBy: "",
  date: "",
};

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function mapNameOptions(data, fallbackPrefix) {
  return extractList(data)
    .map((item) => ({
      id: String(item.id ?? item.productId ?? item.supplierId ?? item.warehouseId ?? item.customerId),
      name:
        item.code ||
        item.productCode ||
        item.supplierCode ||
        item.warehouseCode ||
        item.customerCode ||
        item.name ||
        item.productName ||
        item.supplierName ||
        item.warehouseName ||
        item.label ||
        `${fallbackPrefix} #${item.id}`,
    }))
    .filter((item) => item.id && item.name);
}

function mapLocationOptions(data) {
  return extractList(data)
    .map((item) => ({
      id: String(item.id ?? item.locationId),
      warehouseId: String(item.warehouseId ?? item.warehouse?.id ?? ""),
      code: item.code || item.locationCode || "",
      name:
        item.name ||
        item.locationName ||
        item.code ||
        item.locationCode ||
        `Location #${item.id ?? item.locationId}`,
      label: (() => {
        const id = String(item.id ?? item.locationId ?? "");
        const code = item.code || item.locationCode || "";
        const name = item.name || item.locationName || "";
        if (code && name && code !== name) return `${code} (${name})`;
        if (code) return code;
        if (name) return `${name}${id ? ` (#${id})` : ""}`;
        return `Location #${id}`;
      })(),
    }))
    .filter((item) => item.id && item.name);
}

function mapWarehouseOptionsFromLocations(data) {
  const unique = new Map();

  extractList(data).forEach((item) => {
    const id = item.warehouseId != null ? String(item.warehouseId) : "";
    if (!id || unique.has(id)) return;

    unique.set(id, {
      id,
      name: item.warehouseCode || item.warehouseName || `Warehouse #${id}`,
    });
  });

  return Array.from(unique.values());
}

function mapStockEntries(data) {
  return extractList(data)
    .map((item) => ({
      productId: String(item.productId ?? item.product?.id ?? ""),
      locationId: String(item.locationId ?? item.location?.id ?? ""),
      warehouseId: String(item.warehouseId ?? item.location?.warehouseId ?? item.location?.warehouse?.id ?? ""),
      locationCode: item.locationCode || item.location?.code || "",
      locationName:
        item.locationName ||
        item.location?.name ||
        item.locationCode ||
        item.location?.code ||
        `Location #${item.locationId ?? item.location?.id}`,
      quantity: Number(item.quantity ?? 0),
    }))
    .filter((item) => item.productId && item.locationId);
}

function mapPendingMovements(data) {
  return extractList(data).map((item) => ({
    id: item.id,
    productName: item.productCode || item.productName || "-",
    fromLocationName: item.fromLocationCode || item.fromLocationName || "-",
    toLocationName: item.toLocationCode || item.toLocationName || "-",
    quantity: item.quantity ?? 0,
    movementType: item.movementType || "-",
    movementReason: item.movementReason || "-",
    destinationType: item.destinationType || "-",
    destinationId: item.destinationId ?? null,
    destinationName:
      item.destinationName ||
      item.destination?.name ||
      item.supplierName ||
      item.customerName ||
      item.warehouseName ||
      "",
    status: item.status || "PENDING",
    createdBy: item.createdBy || "-",
    createdAt: item.createdAt || null,
    notes: item.notes || "",
  }));
}

function readEntityName(entity) {
  if (!entity || typeof entity !== "object") return "";
  return (
    entity.name ||
    entity.supplierName ||
    entity.customerName ||
    entity.warehouseName ||
    entity.code ||
    entity.supplierCode ||
    entity.customerCode ||
    entity.warehouseCode ||
    ""
  );
}

function findEntityNameById(data, targetId) {
  const idStr = String(targetId ?? "");
  const list = extractList(data);
  const found = list.find((item) => {
    const candidate = item?.id ?? item?.supplierId ?? item?.customerId ?? item?.warehouseId;
    return String(candidate ?? "") === idStr;
  });
  return readEntityName(found);
}

function destinationKey(destinationType, destinationId) {
  return `${destinationType}:${destinationId}`;
}

function isIdFallbackLabel(destinationType, destinationId, label) {
  const value = String(label || "").trim().toLowerCase();
  const id = String(destinationId || "").trim().toLowerCase();
  if (!value || !id) return false;

  if (value === id || value === `#${id}`) return true;

  const prefixByType = {
    SUPPLIER: "supplier",
    CUSTOMER: "customer",
    WAREHOUSE: "warehouse",
  };

  const prefix = prefixByType[String(destinationType || "").toUpperCase()];
  if (!prefix) return false;

  return value === `${prefix} ${id}` || value === `${prefix} #${id}`;
}

async function fetchFirstSuccessful(paths) {
  for (const path of paths) {
    try {
      const response = await api.get(path);
      return response.data;
    } catch {
      // try next path
    }
  }
  throw new Error("All candidate endpoints failed");
}

function Icon({ type }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" };

  if (type === "check") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (type === "x") return <svg {...common}><path d="m18 6-12 12M6 6l12 12" /></svg>;
  if (type === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg>;
  return <svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
}

function typeClass(type) {
  if (type === "IN") return styles.typeIn;
  if (type === "OUT") return styles.typeOut;
  return styles.typeTransfer;
}

function statusClass(status) {
  if (status === "VALIDATED") return styles.statusValidated;
  if (status === "REJECTED") return styles.statusRejected;
  return styles.statusPending;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function sameDay(isoDate, filterDate) {
  if (!isoDate || !filterDate) return true;
  const d = new Date(isoDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}` === filterDate;
}

export default function StockMovementPage() {
  const { role, user } = useAuth();
  const currentWarehouseId = String(user?.warehouseId ?? user?.warehouse?.id ?? "");
  const shouldScopeToUserWarehouse = role === "MAGASINIER";
  const canCreateMovement = role === "MAGASINIER";
  const canReviewMovements = role === "ADMIN";

  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [products, setProducts] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [pendingMovements, setPendingMovements] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [resolvedDestinationNames, setResolvedDestinationNames] = useState({});

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({ id: null, type: "" });

  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const showFromLocation = form.movementType === "OUT" || form.movementType === "TRANSFER";
  const showToLocation = form.movementType === "IN" || form.movementType === "TRANSFER";
  const showPartySelector = form.movementType === "OUT" || form.movementType === "IN";
  const movementReasonOptions = useMemo(() => reasonByMovementType[form.movementType] || [], [form.movementType]);
  const partyTypeLabel = form.movementType === "IN" ? "From Type" : "Destination Type";
  const partyLabel = form.movementType === "IN" ? "From" : "Destination";
  const partyPlaceholder = form.movementType === "IN" ? "Select from" : "Select destination";
  const forcedDestinationType = forcedDestinationTypeByReason[form.movementReason] || "";
  const allowedDestinationTypes = forcedDestinationType
    ? [forcedDestinationType]
    : canCreateMovement
      ? destinationTypes.filter((type) => type !== "CUSTOMER")
      : destinationTypes;

  const destinationOptions = useMemo(() => {
    if (form.destinationType === "WAREHOUSE") return warehouses;
    if (form.destinationType === "SUPPLIER") return suppliers;
    if (form.destinationType === "CUSTOMER") return customers;
    return [];
  }, [form.destinationType, warehouses, suppliers, customers]);

  const fromLocationOptions = useMemo(() => {
    if (!showFromLocation || !form.productId) return [];

    const unique = new Map();

    stocks
      .filter((item) => item.productId === form.productId && item.quantity > 0)
      .forEach((item) => {
        if (unique.has(item.locationId)) return;
        const locationFromMaster = allLocations.find((loc) => loc.id === item.locationId);
        const locationLabel =
          locationFromMaster?.code ||
          locationFromMaster?.label ||
          item.locationCode ||
          locationFromMaster?.name ||
          item.locationName;

        unique.set(item.locationId, {
          id: item.locationId,
          label: locationLabel
            ? `${locationLabel}${item.locationId ? ` (#${item.locationId})` : ""}`
            : `Location #${item.locationId}`,
        });
      });

    return Array.from(unique.values());
  }, [showFromLocation, form.productId, stocks, allLocations]);

  const toLocationOptions = useMemo(() => {
    if (!showToLocation || !form.productId) return [];

    const productLocations = (() => {
      const unique = new Map();
      stocks
        .filter((item) => item.productId === form.productId)
        .forEach((item) => {
          if (unique.has(item.locationId)) return;
          const locationFromMaster = allLocations.find((loc) => loc.id === item.locationId);
          const baseLabel =
            locationFromMaster?.label ||
            locationFromMaster?.code ||
            item.locationCode ||
            locationFromMaster?.name ||
            item.locationName;
          unique.set(item.locationId, {
            id: item.locationId,
            label: baseLabel
              ? `${baseLabel}${item.locationId ? ` (#${item.locationId})` : ""}`
              : `Location #${item.locationId}`,
            code: locationFromMaster?.code || item.locationCode || "",
            name: locationFromMaster?.name || item.locationName || "",
          });
        });
      return Array.from(unique.values());
    })();

    if (form.movementType === "IN") {
      return productLocations.length ? productLocations : allLocations;
    }
    if (form.movementType !== "TRANSFER") return allLocations;

    const transferTargets = (productLocations.length ? productLocations : allLocations).filter(
      (location) => location.id !== form.fromLocationId
    );
    return transferTargets;
  }, [showToLocation, form.productId, form.movementType, allLocations, stocks, form.fromLocationId]);

  const destinationMaps = useMemo(
    () => ({
      WAREHOUSE: new Map(warehouses.map((item) => [item.id, item.name])),
      SUPPLIER: new Map(suppliers.map((item) => [item.id, item.name])),
      CUSTOMER: new Map(customers.map((item) => [item.id, item.name])),
    }),
    [warehouses, suppliers, customers]
  );

  const getDestinationLabel = (destinationType, destinationId) => {
    if (!destinationType || !destinationId) return "-";
    const map = destinationMaps[destinationType];
    if (!map) return "";
    return map.get(String(destinationId)) || "";
  };

  const resolveDestinationName = async (destinationType, destinationId) => {
    if (!destinationType || !destinationId) return "";

    const mapped = getDestinationLabel(destinationType, destinationId);
    if (mapped && !isIdFallbackLabel(destinationType, destinationId, mapped)) return mapped;

    const id = String(destinationId);
    const type = String(destinationType).toUpperCase();

    const detailPathsByType = {
      SUPPLIER: [`/api/owner/suppliers/${id}`],
      CUSTOMER: [`/api/owner/customers/${id}`, `/api/customers/${id}`],
      WAREHOUSE: [`/api/owner/warehouses/${id}`],
    };

    const listPathsByType = {
      SUPPLIER: ["/api/owner/suppliers"],
      CUSTOMER: ["/api/owner/customers", "/api/customers"],
      WAREHOUSE: ["/api/owner/warehouses"],
    };

    const detailPaths = detailPathsByType[type] || [];
    for (const path of detailPaths) {
      try {
        const response = await api.get(path);
        const fromDetail =
          readEntityName(response.data) ||
          readEntityName(response.data?.data) ||
          findEntityNameById(response.data, id);
        if (fromDetail) return fromDetail;
      } catch {
        // fallback to next endpoint
      }
    }

    const listPaths = listPathsByType[type] || [];
    if (!listPaths.length) return "";

    try {
      const listData = await fetchFirstSuccessful(listPaths);
      return findEntityNameById(listData, id) || "";
    } catch {
      return "";
    }
  };

  const getDestinationText = (movement) => {
    if (!movement.destinationType || movement.destinationType === "-") return "-";

    const directName = String(movement.destinationName || "").trim();
    if (directName && !isIdFallbackLabel(movement.destinationType, movement.destinationId, directName)) {
      return directName;
    }

    const mapped = getDestinationLabel(movement.destinationType, movement.destinationId);
    if (mapped && !isIdFallbackLabel(movement.destinationType, movement.destinationId, mapped)) {
      return mapped;
    }

    const resolved = resolvedDestinationNames[destinationKey(movement.destinationType, movement.destinationId)];
    return resolved || "-";
  };

  const loadPendingMovements = async () => {
    if (!canReviewMovements) {
      setPendingMovements([]);
      setLoadingPending(false);
      return;
    }

    setLoadingPending(true);
    setListError("");

    try {
      const response = await api.get("/api/movements/pending");
      setPendingMovements(mapPendingMovements(response.data));
    } catch (requestError) {
      setListError(requestError.response?.data?.message || "Could not load pending movements.");
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      if (!canCreateMovement) {
        setLoadingOptions(false);
        return;
      }

      setLoadingOptions(true);
      setFormError("");

      try {
        const [
          productsResult,
          stocksResult,
          locationsResult,
          warehousesResult,
          suppliersResult,
          customersResult,
        ] = await Promise.allSettled([
          fetchFirstSuccessful(["/api/owner/products"]),
          fetchFirstSuccessful(["/api/stocks"]),
          fetchFirstSuccessful(["/api/locations"]),
          fetchFirstSuccessful(["/api/owner/warehouses"]),
          fetchFirstSuccessful(["/api/owner/suppliers"]),
          fetchFirstSuccessful(["/api/owner/customers", "/api/customers"]),
        ]);

        const scopeByWarehouse = shouldScopeToUserWarehouse;
        const scopedLocationList =
          locationsResult.status === "fulfilled"
            ? mapLocationOptions(locationsResult.value).filter((location) => {
              if (!scopeByWarehouse) return true;
              if (!currentWarehouseId) return false;
              if (!location.warehouseId) return false;
              return location.warehouseId === currentWarehouseId;
            })
            : [];
        const scopedLocationIds = new Set(scopedLocationList.map((location) => location.id));

        if (productsResult.status === "fulfilled") {
          setProducts(mapNameOptions(productsResult.value, "Product"));
        } else {
          setProducts([]);
          setFormError("Could not load products. Please check your access rights.");
        }

        if (stocksResult.status === "fulfilled") {
          const scopedStocks = mapStockEntries(stocksResult.value).filter((stock) => {
            if (!scopeByWarehouse) return true;
            if (!currentWarehouseId) return false;
            if (stock.warehouseId) return stock.warehouseId === currentWarehouseId;
            if (scopedLocationIds.size > 0) return scopedLocationIds.has(stock.locationId);
            return false;
          });
          setStocks(scopedStocks);
        } else {
          setStocks([]);
        }

        const locationWarehousesFallback =
          scopedLocationList.length
            ? mapWarehouseOptionsFromLocations(scopedLocationList)
            : [];

        if (locationsResult.status === "fulfilled") {
          setAllLocations(scopedLocationList);
        } else {
          setAllLocations([]);
        }

        if (warehousesResult.status === "fulfilled") {
          const ownerWarehouses = mapNameOptions(warehousesResult.value, "Warehouse");
          const scopedWarehouses =
            scopeByWarehouse
              ? currentWarehouseId
                ? ownerWarehouses.filter((warehouse) => warehouse.id === currentWarehouseId)
                : []
              : ownerWarehouses;
          setWarehouses(scopedWarehouses.length ? scopedWarehouses : locationWarehousesFallback);
        } else {
          setWarehouses(locationWarehousesFallback);
        }

        if (suppliersResult.status === "fulfilled") {
          setSuppliers(mapNameOptions(suppliersResult.value, "Supplier"));
        } else {
          setSuppliers([]);
        }

        if (customersResult.status === "fulfilled") {
          setCustomers(mapNameOptions(customersResult.value, "Customer"));
        } else {
          setCustomers([]);
        }
      } catch {
        setFormError("Could not load movement form data. Please check API access.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
    loadPendingMovements();
  }, [canCreateMovement, canReviewMovements, shouldScopeToUserWarehouse, currentWarehouseId]);

  useEffect(() => {
    const loadDestinationReferencesForReview = async () => {
      if (!canReviewMovements || canCreateMovement) return;
      try {
        const [warehousesData, suppliersData, customersData] = await Promise.all([
          fetchFirstSuccessful(["/api/owner/warehouses"]),
          fetchFirstSuccessful(["/api/owner/suppliers"]),
          fetchFirstSuccessful(["/api/owner/customers", "/api/customers"]),
        ]);

        setWarehouses(mapNameOptions(warehousesData, "Warehouse"));
        setSuppliers(mapNameOptions(suppliersData, "Supplier"));
        setCustomers(mapNameOptions(customersData, "Customer"));
      } catch {
        // destination names will still resolve through per-destination detail fetch fallback
      }
    };

    loadDestinationReferencesForReview();
  }, [canReviewMovements, canCreateMovement]);

  useEffect(() => {
    const resolveMissingDestinations = async () => {
      if (!canReviewMovements || !pendingMovements.length) return;

      const unresolvedMovements = pendingMovements.filter((movement) => {
        const hasDirect = String(movement.destinationName || "").trim();
        if (hasDirect) return false;
        if (!movement.destinationType || movement.destinationType === "-") return false;
        if (!movement.destinationId) return false;

        const alreadyMapped = getDestinationLabel(movement.destinationType, movement.destinationId);
        if (
          alreadyMapped &&
          !isIdFallbackLabel(movement.destinationType, movement.destinationId, alreadyMapped)
        ) {
          return false;
        }

        return !resolvedDestinationNames[destinationKey(movement.destinationType, movement.destinationId)];
      });

      if (!unresolvedMovements.length) return;

      const uniqueByKey = new Map();
      unresolvedMovements.forEach((movement) => {
        const key = destinationKey(movement.destinationType, movement.destinationId);
        if (!uniqueByKey.has(key)) {
          uniqueByKey.set(key, movement);
        }
      });

      const entries = await Promise.all(
        Array.from(uniqueByKey.values()).map(async (movement) => {
          const key = destinationKey(movement.destinationType, movement.destinationId);
          const name = await resolveDestinationName(movement.destinationType, movement.destinationId);
          return [key, name];
        })
      );

      setResolvedDestinationNames((prev) => {
        const next = { ...prev };
        entries.forEach(([key, name]) => {
          if (name) next[key] = name;
        });
        return next;
      });
    };

    resolveMissingDestinations();
  }, [canReviewMovements, pendingMovements, resolvedDestinationNames, destinationMaps]);

  useEffect(() => {
    if (allowedDestinationTypes.includes(form.destinationType)) return;
    setForm((prev) => ({ ...prev, destinationType: allowedDestinationTypes[0] || "" }));
  }, [allowedDestinationTypes, form.destinationType]);

  useEffect(() => {
    if (!forcedDestinationType) return;
    if (form.destinationType === forcedDestinationType) return;
    setForm((prev) => ({ ...prev, destinationType: forcedDestinationType }));
  }, [forcedDestinationType, form.destinationType]);

  useEffect(() => {
    setForm((prev) => {
      const nextDestinationId = destinationOptions.some(
        (option) => option.id === prev.destinationId
      )
        ? prev.destinationId
        : "";

      if (nextDestinationId === prev.destinationId) return prev;

      return {
        ...prev,
        destinationId: nextDestinationId,
      };
    });
  }, [destinationOptions]);

  useEffect(() => {
    if (!forcedDestinationType) return;
    setForm((prev) => {
      if (prev.destinationId) return prev;
      if (!destinationOptions.length) return prev;
      return { ...prev, destinationId: destinationOptions[0].id };
    });
  }, [forcedDestinationType, destinationOptions]);

  useEffect(() => {
    setForm((prev) => {
      if (!prev.movementType) {
        if (!prev.movementReason) return prev;
        return { ...prev, movementReason: "" };
      }

      const allowedReasons = reasonByMovementType[prev.movementType] || [];
      if (allowedReasons.includes(prev.movementReason)) return prev;
      return { ...prev, movementReason: "" };
    });
  }, [form.movementType]);

  useEffect(() => {
    setForm((prev) => {
      const nextFromLocationId = fromLocationOptions.some(
        (option) => option.id === prev.fromLocationId
      )
        ? prev.fromLocationId
        : "";

      const nextToLocationId = toLocationOptions.some(
        (option) => option.id === prev.toLocationId
      )
        ? prev.toLocationId
        : "";

      if (
        nextFromLocationId === prev.fromLocationId &&
        nextToLocationId === prev.toLocationId
      ) {
        return prev;
      }

      return {
        ...prev,
        fromLocationId: nextFromLocationId,
        toLocationId: nextToLocationId,
      };
    });
  }, [fromLocationOptions, toLocationOptions]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleCreateMovement = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    if (
      !form.productId ||
      !form.movementType ||
      !form.movementReason ||
      (showFromLocation && !form.fromLocationId) ||
      (showToLocation && !form.toLocationId) ||
      !form.quantity ||
      Number(form.quantity) <= 0 ||
      (showPartySelector && (!form.destinationType || !form.destinationId))
    ) {
      setFormError("Please complete all required fields with valid values.");
      setSubmitting(false);
      return;
    }

    const payload = {
      productId: Number(form.productId),
      fromLocationId: showFromLocation ? Number(form.fromLocationId) : undefined,
      toLocationId: showToLocation ? Number(form.toLocationId) : undefined,
      quantity: Number(form.quantity),
      movementType: form.movementType,
      movementReason: form.movementReason,
      destinationType: showPartySelector ? form.destinationType : undefined,
      destinationId: showPartySelector ? Number(form.destinationId) : undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      const response = await api.post("/api/movements", payload);
      const createdMovement = mapPendingMovements([response.data])[0];
      if (createdMovement) {
        const enrichedMovement = {
          ...createdMovement,
          destinationName:
            createdMovement.destinationName ||
            getDestinationLabel(createdMovement.destinationType, createdMovement.destinationId) ||
            "",
        };
        setMyRequests((prev) => [enrichedMovement, ...prev]);
      }
      setSuccessMessage("Movement request created successfully.");
      resetForm();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || "Could not create movement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (movementId) => {
    setActionLoading({ id: movementId, type: "validate" });
    setListError("");
    setSuccessMessage("");

    try {
      await api.put(`/api/movements/${movementId}/validate`);
      setSuccessMessage(`Movement #${movementId} validated successfully.`);
      await loadPendingMovements();
    } catch (requestError) {
      setListError(requestError.response?.data?.message || "Could not validate movement.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleReject = async (movementId) => {
    setActionLoading({ id: movementId, type: "reject" });
    setListError("");
    setSuccessMessage("");

    try {
      await api.put(`/api/movements/${movementId}/reject`);
      setSuccessMessage(`Movement #${movementId} rejected successfully.`);
      await loadPendingMovements();
    } catch (requestError) {
      setListError(requestError.response?.data?.message || "Could not reject movement.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filteredMovements = useMemo(() => {
    return pendingMovements.filter((movement) => {
      if (
        appliedFilters.product &&
        !movement.productName.toLowerCase().includes(appliedFilters.product.toLowerCase())
      ) {
        return false;
      }

      if (appliedFilters.movementType && movement.movementType !== appliedFilters.movementType) {
        return false;
      }

      if (
        appliedFilters.createdBy &&
        !movement.createdBy.toLowerCase().includes(appliedFilters.createdBy.toLowerCase())
      ) {
        return false;
      }

      if (appliedFilters.date && !sameDay(movement.createdAt, appliedFilters.date)) {
        return false;
      }

      return true;
    });
  }, [pendingMovements, appliedFilters]);

  const pendingCount = canCreateMovement
    ? myRequests.filter((item) => item.status === "PENDING").length
    : pendingMovements.filter((item) => item.status === "PENDING").length;
  const totalMovements = canCreateMovement ? myRequests.length : pendingMovements.length;

  const createdByOptions = Array.from(
    new Set(pendingMovements.map((item) => item.createdBy).filter(Boolean))
  );

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Movement Requests</h1>
          <p className={styles.subtitle}>Create and track your warehouse stock movement requests.</p>
        </div>
        {canReviewMovements ? (
          <div className={styles.indicators}>
            <span className={styles.indicator}>
              <Icon type="clock" />
              Pending Requests: {pendingCount}
            </span>
            <span className={styles.indicator}>
              <Icon type="box" />
              Total Requests: {totalMovements}
            </span>
          </div>
        ) : null}
      </header>

      {canCreateMovement ? (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Create Movement Request</h3>

          {loadingOptions ? <p className={styles.info}>Loading form options...</p> : null}

          {!loadingOptions ? (
            <form className={styles.form} onSubmit={handleCreateMovement}>
              <section className={styles.stepSection}>
                <div className={styles.stepTitle}><span>1</span> Step 1: Product & Quantity</div>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label>Product</label>
                    <select value={form.productId} onChange={(e) => handleFieldChange("productId", e.target.value)} required>
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Quantity</label>
                    <input type="number" min="1" value={form.quantity} onChange={(e) => handleFieldChange("quantity", e.target.value)} placeholder="0" required />
                  </div>
                </div>
              </section>

              <section className={styles.stepSection}>
                <div className={styles.stepTitle}><span>2</span> Step 2: Movement Details</div>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label>Movement Type</label>
                    <select value={form.movementType} onChange={(e) => handleFieldChange("movementType", e.target.value)} required>
                      <option value="">Select movement type</option>
                      {movementTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Movement Reason</label>
                    <select value={form.movementReason} onChange={(e) => handleFieldChange("movementReason", e.target.value)} required disabled={!form.movementType}>
                      <option value="">{form.movementType ? "Select movement reason" : "Select movement type first"}</option>
                      {movementReasonOptions.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className={styles.stepSection}>
                <div className={styles.stepTitle}><span>3</span> Step 3: Destination / Location</div>
                <div className={styles.grid}>
                  {showFromLocation ? (
                    <div className={styles.field}>
                      <label>From Location</label>
                      <select value={form.fromLocationId} onChange={(e) => handleFieldChange("fromLocationId", e.target.value)} required={showFromLocation} disabled={!form.productId}>
                        <option value="">{form.productId ? "Select from location" : "Select product first"}</option>
                        {fromLocationOptions.map((location) => (
                          <option key={location.id} value={location.id}>{location.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {showToLocation ? (
                    <div className={styles.field}>
                      <label>To Location</label>
                      <select value={form.toLocationId} onChange={(e) => handleFieldChange("toLocationId", e.target.value)} required={showToLocation} disabled={!form.productId}>
                        <option value="">{form.productId ? "Select to location" : "Select product first"}</option>
                        {toLocationOptions.map((location) => (
                          <option key={location.id} value={location.id}>{location.label || location.code || location.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {showPartySelector ? (
                    <>
                      <div className={styles.field}>
                        <label>{partyTypeLabel}</label>
                        <select value={form.destinationType} onChange={(e) => handleFieldChange("destinationType", e.target.value)} required disabled={Boolean(forcedDestinationType)}>
                          {allowedDestinationTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.field}>
                        <label>{partyLabel}</label>
                        <select value={form.destinationId} onChange={(e) => handleFieldChange("destinationId", e.target.value)} required>
                          <option value="">{partyPlaceholder}</option>
                          {destinationOptions.map((destination) => (
                            <option key={destination.id} value={destination.id}>{destination.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : null}
                </div>
              </section>

              <section className={styles.stepSection}>
                <div className={styles.stepTitle}><span>4</span> Step 4: Notes</div>
                <div className={styles.field}>
                  <label>Optional Notes</label>
                  <textarea rows="2" value={form.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} placeholder="Optional notes for this movement request" />
                </div>
              </section>

              {formError ? <p className={styles.error}>{formError}</p> : null}
              {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

              <div className={styles.formActions}>
                <Button type="submit" fullWidth={false} disabled={submitting}>{submitting ? "Submitting..." : "Create Movement Request"}</Button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}

      {canReviewMovements ? (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Pending Movements</h3>

          <div className={styles.filterBar}>
            <input placeholder="Product" value={filters.product} onChange={(e) => handleFilterChange("product", e.target.value)} />
            <select value={filters.movementType} onChange={(e) => handleFilterChange("movementType", e.target.value)}>
              <option value="">Type</option>
              {movementTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={filters.createdBy} onChange={(e) => handleFilterChange("createdBy", e.target.value)}>
              <option value="">Created By</option>
              {createdByOptions.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
            <button type="button" className={styles.searchBtn} onClick={handleSearch}>Search</button>
            <button type="button" className={styles.resetBtn} onClick={handleResetFilters}>Reset</button>
          </div>

          {listError ? <p className={styles.error}>{listError}</p> : null}
          {loadingPending ? <p className={styles.info}>Loading pending movements...</p> : null}

          {!loadingPending && !filteredMovements.length ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Icon type="box" /></span>
              <p className={styles.emptyTitle}>No pending stock movements</p>
              <p className={styles.emptyDesc}>New validation requests will appear here.</p>
            </div>
          ) : null}

          {!loadingPending && filteredMovements.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Locations</th>
                    <th>Destination</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => {
                    const validating = actionLoading.id === movement.id && actionLoading.type === "validate";
                    const rejecting = actionLoading.id === movement.id && actionLoading.type === "reject";

                    return (
                      <tr key={movement.id}>
                        <td>
                          <p className={styles.productName}>{movement.productName}</p>
                          <p className={styles.productId}>MV #{movement.id}</p>
                        </td>
                        <td><span className={`${styles.badge} ${typeClass(movement.movementType)}`}>{movement.movementType}</span></td>
                        <td><span className={styles.reasonText}>{movement.movementReason}</span></td>
                        <td>
                          <p className={styles.locationText}>FROM: {movement.fromLocationName || "-"}</p>
                          <p className={styles.locationText}>TO: {movement.toLocationName || "-"}</p>
                        </td>
                        <td className={styles.destinationText}>{getDestinationText(movement)}</td>
                        <td className={styles.qty}>{movement.quantity}</td>
                        <td><span className={`${styles.badge} ${statusClass(movement.status)}`}>{movement.status}</span></td>
                        <td>
                          <div className={styles.creator}>
                            <span className={styles.creatorAvatar}>{movement.createdBy?.charAt(0)?.toUpperCase() || "U"}</span>
                            <span>{movement.createdBy}</span>
                          </div>
                        </td>
                        <td className={styles.dateCell}>{formatDate(movement.createdAt)}</td>
                        <td><span className={styles.notes} title={movement.notes || "-"}>{movement.notes || "-"}</span></td>
                        <td>
                          <div className={styles.rowActions}>
                            <button className={styles.validateBtn} disabled={Boolean(actionLoading.id)} onClick={() => handleValidate(movement.id)}>
                              <Icon type="check" />
                              {validating ? "Validating..." : "Validate"}
                            </button>
                            <button className={styles.rejectBtn} disabled={Boolean(actionLoading.id)} onClick={() => handleReject(movement.id)}>
                              <Icon type="x" />
                              {rejecting ? "Rejecting..." : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
