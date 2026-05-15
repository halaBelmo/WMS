import api from "./api";

const BASE = "/api/analytics";

export async function fetchForceBatch() {
  const response = await api.post(`${BASE}/force-batch`);
  return response.data;
}

export async function fetchTopEntries(warehouseId, jours) {
  const response = await api.get(`${BASE}/${warehouseId}/top-entrees`, { params: { jours } });
  return response.data ?? [];
}

export async function fetchTopExits(warehouseId, jours) {
  const response = await api.get(`${BASE}/${warehouseId}/top-sorties`, { params: { jours } });
  return response.data ?? [];
}

export async function fetchRatioInOut(warehouseId, jours) {
  const response = await api.get(`${BASE}/${warehouseId}/ratio-in-out`, { params: { jours } });
  return response.data ?? [];
}

export async function fetchReasons(warehouseId, jours) {
  const response = await api.get(`${BASE}/${warehouseId}/raisons`, { params: { jours } });
  return response.data ?? [];
}

export async function fetchDormantProducts(warehouseId, jours) {
  const response = await api.get(`${BASE}/${warehouseId}/dormant-products`, { params: { jours } });
  return response.data ?? [];
}

export async function fetchCustomerReturns(warehouseId, jours) {
  const response = await api.get(`${BASE}/${warehouseId}/retours-clients`, { params: { jours } });
  return response.data ?? [];
}

export async function fetchWarehouses() {
  const response = await api.get("/api/owner/warehouses");
  const list = Array.isArray(response.data) ? response.data : response.data?.warehouses || [];
  return list.map((item) => ({
    id: item.id ?? item.warehouseId,
    name: item.name ?? item.warehouseName ?? `Warehouse ${item.id ?? item.warehouseId}`,
  }));
}
