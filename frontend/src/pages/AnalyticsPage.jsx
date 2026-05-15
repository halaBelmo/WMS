import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import styles from "./Analyticspage.module.css";
import {
  fetchCustomerReturns,
  fetchDormantProducts,
  fetchForceBatch,
  fetchRatioInOut,
  fetchReasons,
  fetchTopEntries,
  fetchTopExits,
  fetchWarehouses,
} from "../services/analyticsService";
import { CustomerReturnsBarChart, RatioChart, ReasonsDonutChart, TopEntriesBarChart, TopExitsBarChart } from "../components/analytics/AnalyticsCharts";

const parseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/\s/g, "")
  );
  return Number.isFinite(parsed) ? parsed : 0;
};

function EmptyData({ message }) {
  return <div className={styles.emptyState}>{message}</div>;
}

function SectionCard({ title, children }) {
  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {children}
    </section>
  );
}

function AnalyticsTable({ columns, rows }) {
  if (!rows.length) return <EmptyData message="No rows to display for selected filters." />;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((c) => <td key={c.key}>{row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyPlot({ xLabel = "Products", yLabel = "Days Without Movement" }) {
  return (
    <div className={styles.emptyPlotWrap}>
      <svg viewBox="0 0 600 260" className={styles.emptyPlotSvg} role="img" aria-label="Empty chart">
        <line x1="70" y1="25" x2="70" y2="215" className={styles.emptyPlotAxis} />
        <line x1="70" y1="215" x2="565" y2="215" className={styles.emptyPlotAxis} />
        <line x1="70" y1="165" x2="565" y2="165" className={styles.emptyPlotGrid} />
        <line x1="70" y1="115" x2="565" y2="115" className={styles.emptyPlotGrid} />
        <line x1="70" y1="65" x2="565" y2="65" className={styles.emptyPlotGrid} />
        <text x="315" y="245" textAnchor="middle" className={styles.emptyPlotLabel}>{xLabel}</text>
        <text x="18" y="130" textAnchor="middle" transform="rotate(-90 18 130)" className={styles.emptyPlotLabel}>
          {yLabel}
        </text>
        <text x="315" y="130" textAnchor="middle" className={styles.emptyPlotHint}>No data for selected filters</text>
      </svg>
    </div>
  );
}

function SummaryList({ rows, keyField, labelField, valueField, percentField }) {
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + parseNumber(row[valueField]), 0);
  return (
    <div className={styles.summaryList}>
      {rows.map((row) => {
        const label = row[labelField] ?? "-";
        const value = parseNumber(row[valueField]);
        const percent =
          row[percentField] != null ? Number(row[percentField]) : (total > 0 ? (value * 100) / total : 0);
        return (
          <div key={`${label}-${row[keyField] ?? label}`} className={styles.summaryItem}>
            <span>{label}</span>
            <strong>{value.toLocaleString()}</strong>
            <span>{percent.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [jours, setJours] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batchMessage, setBatchMessage] = useState("");
  const [data, setData] = useState({
    raisons: [],
    dormant: [],
    retours: [],
    topEntrees: [],
    topSorties: [],
    ratio: [],
  });

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const list = await fetchWarehouses();
        setWarehouses(list);
        const initialId = String(user?.warehouseId ?? list[0]?.id ?? "1");
        setWarehouseId(initialId);
      } catch {
        setWarehouseId(String(user?.warehouseId ?? "1"));
      }
    }
    loadWarehouses();
  }, [user]);

  useEffect(() => {
    if (!warehouseId) return;
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const numericWarehouseId = Number(warehouseId);
        const [raisons, dormant, retours, topEntrees, topSorties, ratio] = await Promise.all([
          fetchReasons(numericWarehouseId, jours),
          fetchDormantProducts(numericWarehouseId, jours),
          fetchCustomerReturns(numericWarehouseId, jours),
          fetchTopEntries(numericWarehouseId, jours),
          fetchTopExits(numericWarehouseId, jours),
          fetchRatioInOut(numericWarehouseId, jours),
        ]);
        setData({ raisons, dormant, retours, topEntrees, topSorties, ratio });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [warehouseId, jours]);

  const topEntriesChartData = useMemo(
    () =>
      data.topEntrees.map((item) => ({
        name: item.productname || item.productName || "-",
        value: parseNumber(item.total),
      })),
    [data.topEntrees]
  );
  const topExitsChartData = useMemo(
    () =>
      data.topSorties.map((item) => ({
        name: item.productname || item.productName || "-",
        value: parseNumber(item.total),
      })),
    [data.topSorties]
  );
  const returnsChartData = useMemo(
    () =>
      data.retours.map((item) => ({
        name: item.produit || "-",
        value: parseNumber(item.nombre_retours),
      })),
    [data.retours]
  );
  const dormantRows = useMemo(
    () =>
      data.dormant.map((row) => ({
        productName: row.productName ?? row.productname ?? "-",
        lastMovementDate: row.lastMovementDate ?? row.lastmovementdate ?? "-",
        daysWithoutMovement: parseNumber(row.daysWithoutMovement ?? row.dayswithoutmovement).toLocaleString(),
      })),
    [data.dormant]
  );

  useEffect(() => {
    console.log("Top entries chart data:", topEntriesChartData);
    console.log("Top exits chart data:", topExitsChartData);
    console.log("Customer returns chart data:", returnsChartData);
  }, [topEntriesChartData, topExitsChartData, returnsChartData]);

  const kpis = useMemo(() => {
    const totalEntries = topEntriesChartData.reduce((sum, row) => sum + row.value, 0);
    const totalExits = topExitsChartData.reduce((sum, row) => sum + row.value, 0);
    const dormantProducts = data.dormant.length;
    const returnedProducts = returnsChartData.length;
    const inRow = data.ratio.find((r) => r.type === "IN");
    const outRow = data.ratio.find((r) => r.type === "OUT");
    const inValue = parseNumber(inRow?.nb);
    const outValue = parseNumber(outRow?.nb);
    const ratioSummary = outValue > 0 ? `${(inValue / outValue).toFixed(2)} : 1` : "N/A";
    return [
      { label: "Total Entries Quantity", value: totalEntries.toLocaleString() },
      { label: "Total Exits Quantity", value: totalExits.toLocaleString() },
      { label: "Dormant Products", value: dormantProducts.toLocaleString() },
      { label: "Customer Returned Products", value: returnedProducts.toLocaleString() },
      { label: "IN / OUT Ratio", value: ratioSummary },
    ];
  }, [topEntriesChartData, topExitsChartData, returnsChartData, data.dormant, data.ratio]);

  async function handleForceBatch() {
    setBatchMessage("Running batch...");
    try {
      const response = await fetchForceBatch();
      setBatchMessage(typeof response === "string" ? response : "Batch completed.");
    } catch (requestError) {
      setBatchMessage(requestError.response?.data?.message || "Batch failed.");
    }
  }

  return (
    <section className={styles.page}>
      <PageHeader title="Analytics Dashboard" subtitle="Warehouse analytics powered by AnalyticsController." />

      <div className={styles.filters}>
        <label>
          Warehouse
          <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
            {!warehouses.length ? <option value={warehouseId}>Warehouse {warehouseId}</option> : null}
          </select>
        </label>
        <label>
          Days
          <select value={jours} onChange={(e) => setJours(Number(e.target.value))}>
            <option value={7}>7</option>
            <option value={30}>30</option>
            <option value={90}>90</option>
            <option value={180}>180</option>
            <option value={365}>365</option>
          </select>
        </label>
        <button className={styles.batchButton} onClick={handleForceBatch} type="button">
          Force Batch Refresh
        </button>
      </div>

      {batchMessage ? <p className={styles.batchStatus}>{batchMessage}</p> : null}
      {loading ? <p className={styles.info}>Loading analytics...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <article key={kpi.label} className={styles.kpiCard}>
                <p className={styles.kpiLabel}>{kpi.label}</p>
                <p className={styles.kpiValue}>{kpi.value}</p>
              </article>
            ))}
          </div>

          <div className={styles.gridTwo}>
            <SectionCard title="Movements by Reason">
              <ReasonsDonutChart data={data.raisons} />
              <SummaryList
                rows={data.raisons}
                keyField="name"
                labelField="name"
                valueField="value"
              />
            </SectionCard>
            <SectionCard title="IN vs OUT Ratio">
              <RatioChart data={data.ratio} />
              <SummaryList
                rows={data.ratio}
                keyField="type"
                labelField="type"
                valueField="nb"
                percentField="pourcentage"
              />
            </SectionCard>
          </div>

          <div className={styles.gridTwo}>
            <SectionCard title="Top 10 Entries">
              <TopEntriesBarChart data={topEntriesChartData} />
            </SectionCard>
            <SectionCard title="Top 10 Exits">
              <TopExitsBarChart data={topExitsChartData} />
            </SectionCard>
          </div>

          <SectionCard title="Customer Returns">
            <CustomerReturnsBarChart data={returnsChartData} />
          </SectionCard>

          <SectionCard title="Dormant Products Table">
            {dormantRows.length ? (
              <AnalyticsTable
                columns={[
                  { key: "productName", label: "Product" },
                  { key: "lastMovementDate", label: "Last Movement Date" },
                  { key: "daysWithoutMovement", label: "Days Without Movement" },
                ]}
                rows={dormantRows}
              />
            ) : (
              <EmptyPlot />
            )}
          </SectionCard>
        </>
      ) : null}
    </section>
  );
}
