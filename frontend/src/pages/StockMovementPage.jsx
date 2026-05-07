import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
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
      id: String(
        item.id ?? item.productId ?? item.supplierId ?? item.warehouseId ?? item.customerId
      ),
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
      name: item.name || item.locationName || `Location #${item.id ?? item.locationId}`,
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
      productId: String(item.productId ?? ""),
      locationId: String(item.locationId ?? ""),
      locationCode: item.locationCode || item.location?.code || "",
      locationName:
        item.locationName ||
        item.location?.name ||
        `Location #${item.locationId}`,
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
    status: item.status || "PENDING",
    createdBy: item.createdBy || "-",
    createdAt: item.createdAt || null,
    notes: item.notes || "",
  }));
}

async function fetchFirstSuccessful(paths) {
  for (const path of paths) {
    try {
      const response = await api.get(path);
      return response.data;
    } catch (error) {
      // try next path
    }
  }
  throw new Error("All candidate endpoints failed");
}

export default function StockMovementPage() {
  const { role } = useAuth();
  const canCreateMovement = role === "MAGASINIER";
  const canReviewMovements = role === "ADMIN";

  const [form, setForm] = useState(initialForm);

  const [products, setProducts] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [pendingMovements, setPendingMovements] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({ id: null, type: "" });

  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const showFromLocation =
    form.movementType === "OUT" || form.movementType === "TRANSFER";
  const showToLocation = form.movementType === "IN" || form.movementType === "TRANSFER";
  const showPartySelector =
    form.movementType === "OUT" || form.movementType === "IN";
  const movementReasonOptions = useMemo(
    () => reasonByMovementType[form.movementType] || [],
    [form.movementType]
  );
  const partyTypeLabel = form.movementType === "IN" ? "From Type" : "Destination Type";
  const partyLabel = form.movementType === "IN" ? "From" : "Destination";
  const partyPlaceholder =
    form.movementType === "IN" ? "Select from" : "Select destination";
  const forcedDestinationType =
    forcedDestinationTypeByReason[form.movementReason] || "";
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
          label: locationLabel,
        });
      });

    return Array.from(unique.values());
  }, [showFromLocation, form.productId, stocks, allLocations]);

  const toLocationOptions = useMemo(() => {
    if (!showToLocation || !form.productId) return [];
    if (form.movementType !== "TRANSFER") return allLocations;

    return allLocations.filter((location) => location.id !== form.fromLocationId);
  }, [showToLocation, form.productId, form.movementType, allLocations, form.fromLocationId]);

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
    if (!map) return `#${destinationId}`;
    return map.get(String(destinationId)) || `#${destinationId}`;
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

        if (productsResult.status === "fulfilled") {
          setProducts(mapNameOptions(productsResult.value, "Product"));
        } else {
          setProducts([]);
          setFormError("Could not load products. Please check your access rights.");
        }

        if (stocksResult.status === "fulfilled") {
          setStocks(mapStockEntries(stocksResult.value));
        } else {
          setStocks([]);
        }

        const locationWarehousesFallback =
          locationsResult.status === "fulfilled"
            ? mapWarehouseOptionsFromLocations(locationsResult.value)
            : [];

        if (locationsResult.status === "fulfilled") {
          setAllLocations(mapLocationOptions(locationsResult.value));
        } else {
          setAllLocations([]);
        }

        if (warehousesResult.status === "fulfilled") {
          const ownerWarehouses = mapNameOptions(warehousesResult.value, "Warehouse");
          setWarehouses(ownerWarehouses.length ? ownerWarehouses : locationWarehousesFallback);
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
      } catch (error) {
        setFormError("Could not load movement form data. Please check API access.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
    loadPendingMovements();
  }, [canCreateMovement, canReviewMovements]);

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
      await api.post("/api/movements", payload);
      setSuccessMessage("Movement created successfully.");
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

  return (
    <section className={styles.page}>
      <PageHeader
        title="Stock Movements"
        subtitle={
          canCreateMovement
            ? "Create stock movement requests."
            : "Validate or reject pending stock movement requests."
        }
      />

      {canCreateMovement ? (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Create Movement</h3>

        {loadingOptions ? <p className={styles.info}>Loading form options...</p> : null}

        {!loadingOptions ? (
          <form className={styles.form} onSubmit={handleCreateMovement}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Product</label>
                <select
                  value={form.productId}
                  onChange={(event) => handleFieldChange("productId", event.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Movement Type</label>
                <select
                  value={form.movementType}
                  onChange={(event) => handleFieldChange("movementType", event.target.value)}
                  required
                >
                  <option value="">Select movement type</option>
                  {movementTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Movement Reason</label>
                <select
                  value={form.movementReason}
                  onChange={(event) => handleFieldChange("movementReason", event.target.value)}
                  required
                  disabled={!form.movementType}
                >
                  <option value="">
                    {form.movementType ? "Select movement reason" : "Select movement type first"}
                  </option>
                  {movementReasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {showFromLocation ? (
                <div className={styles.field}>
                  <label>From Location</label>
                  <select
                    value={form.fromLocationId}
                    onChange={(event) => handleFieldChange("fromLocationId", event.target.value)}
                    required={showFromLocation}
                    disabled={!form.productId}
                  >
                    <option value="">
                      {form.productId ? "Select from location" : "Select product first"}
                    </option>
                    {fromLocationOptions.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {showToLocation ? (
                <div className={styles.field}>
                  <label>To Location</label>
                  <select
                    value={form.toLocationId}
                    onChange={(event) => handleFieldChange("toLocationId", event.target.value)}
                    required={showToLocation}
                    disabled={!form.productId}
                  >
                    <option value="">
                      {form.productId ? "Select to location" : "Select product first"}
                    </option>
                    {toLocationOptions.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.label || location.code || location.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className={styles.field}>
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) => handleFieldChange("quantity", event.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              {showPartySelector ? (
                <>
                  <div className={styles.field}>
                    <label>{partyTypeLabel}</label>
                    <select
                      value={form.destinationType}
                      onChange={(event) => handleFieldChange("destinationType", event.target.value)}
                      required={showPartySelector}
                      disabled={Boolean(forcedDestinationType)}
                    >
                      {allowedDestinationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>{partyLabel}</label>
                    <select
                      value={form.destinationId}
                      onChange={(event) => handleFieldChange("destinationId", event.target.value)}
                      required={showPartySelector}
                    >
                      <option value="">{partyPlaceholder}</option>
                      {destinationOptions.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}

              <div className={`${styles.field} ${styles.notesField}`}>
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(event) => handleFieldChange("notes", event.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {formError ? <p className={styles.error}>{formError}</p> : null}
            {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

            <div className={styles.actions}>
              <Button type="submit" fullWidth={false} disabled={submitting}>
                {submitting ? "Submitting..." : "Create Movement"}
              </Button>
            </div>
          </form>
        ) : null}
        </div>
      ) : null}

      {canReviewMovements ? (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Pending Movements</h3>

        {listError ? <p className={styles.error}>{listError}</p> : null}

        {loadingPending ? <p className={styles.info}>Loading pending movements...</p> : null}

        {!loadingPending && !pendingMovements.length ? (
          <p className={styles.info}>No pending movements found.</p>
        ) : null}

        {!loadingPending && pendingMovements.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>From Location</th>
                  <th>To Location</th>
                  <th>Destination Type</th>
                  <th>Destination</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMovements.map((movement) => {
                  const validating =
                    actionLoading.id === movement.id && actionLoading.type === "validate";
                  const rejecting =
                    actionLoading.id === movement.id && actionLoading.type === "reject";

                  return (
                    <tr key={movement.id}>
                      <td>{movement.productName}</td>
                      <td>{movement.movementType}</td>
                      <td>{movement.movementReason}</td>
                      <td>{movement.fromLocationName}</td>
                      <td>{movement.toLocationName}</td>
                      <td>{movement.destinationType}</td>
                      <td>
                        {getDestinationLabel(movement.destinationType, movement.destinationId)}
                      </td>
                      <td>{movement.quantity}</td>
                      <td>{movement.status}</td>
                      <td>{movement.createdBy}</td>
                      <td>
                        {movement.createdAt
                          ? new Date(movement.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>{movement.notes || "-"}</td>
                      <td className={styles.rowActions}>
                        <Button
                          variant="outline"
                          fullWidth={false}
                          disabled={Boolean(actionLoading.id)}
                          onClick={() => handleValidate(movement.id)}
                        >
                          {validating ? "Validating..." : "Validate"}
                        </Button>
                        <Button
                          variant="outline"
                          fullWidth={false}
                          disabled={Boolean(actionLoading.id)}
                          onClick={() => handleReject(movement.id)}
                        >
                          {rejecting ? "Rejecting..." : "Reject"}
                        </Button>
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
