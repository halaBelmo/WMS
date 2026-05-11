import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import styles from "./AnalyticsPage.module.css";
import api from "../services/api";

const ANALYTICS = "/api/analytics";

// ── Data hook ────────────────────────────────────────────────────────────────
function useAnalytics(warehouseId, jours) {
  const [topSorties, setTopSorties]   = useState([]);
  const [topEntrees, setTopEntrees]   = useState([]);
  const [ratioInOut, setRatioInOut]   = useState([]);
  const [loading,    setLoading]      = useState(false);
  const [error,      setError]        = useState(null);

  const fetchAll = useCallback(() => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`${ANALYTICS}/${warehouseId}/top-sorties?jours=${jours}`),
      api.get(`${ANALYTICS}/${warehouseId}/top-entrees?jours=${jours}`),
      api.get(`${ANALYTICS}/${warehouseId}/ratio-in-out?jours=${jours}`),
    ])
      .then(([sortiesRes, entreesRes, ratioRes]) => {
        setTopSorties(sortiesRes.data ?? []);
        setTopEntrees(entreesRes.data ?? []);
        setRatioInOut(ratioRes.data   ?? []);
      })
      .catch((e) => {
        const status = e.response?.status;
        if (status === 403 || status === 401) {
          setError("Session expirée ou non autorisé — reconnectez-vous.");
        } else {
          setError(e.response?.data?.message ?? e.message ?? "Erreur inconnue");
        }
      })
      .finally(() => setLoading(false));
  }, [warehouseId, jours]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { topSorties, topEntrees, ratioInOut, loading, error, refetch: fetchAll };
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, valueKey = "total", labelKey = "productname", color = "orange" }) {
  if (!data || data.length === 0)
    return <p className={styles.empty}>Aucune donnée disponible pour cette période.</p>;

  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0));
  const gradients = {
    orange: ["#f97316", "#fb923c"],
    blue:   ["#3b82f6", "#60a5fa"],
  };
  const [c1, c2] = gradients[color] ?? gradients.orange;

  return (
    <div className={styles.barChart}>
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = max > 0 ? Math.round((val / max) * 100) : 0;
        return (
          <div key={i} className={styles.barRow}>
            <span className={styles.barLabel} title={item[labelKey]}>
              {item[labelKey] ?? "—"}
            </span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${c1}, ${c2})`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </div>
            <span className={styles.barValue}>{val.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  if (!data || data.length === 0)
    return <p className={styles.empty}>Aucune donnée disponible.</p>;

  const COLORS = { IN: "#3b82f6", OUT: "#f97316", TRANSFER: "#8b5cf6" };
  const total = data.reduce((s, d) => s + Number(d.nb || 0), 0);
  const R = 60, r_inner = 35, CX = 80, CY = 80;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = total > 0 ? (Number(d.nb) / total) * 2 * Math.PI : 0;
    const slice = { ...d, startAngle, endAngle: startAngle + angle };
    startAngle += angle;
    return slice;
  });

  function arc(cx, cy, R, r, sa, ea) {
    if (Math.abs(ea - sa) < 0.001) return "";
    const x1  = cx + R * Math.cos(sa), y1  = cy + R * Math.sin(sa);
    const x2  = cx + R * Math.cos(ea), y2  = cy + R * Math.sin(ea);
    const ix1 = cx + r * Math.cos(ea), iy1 = cy + r * Math.sin(ea);
    const ix2 = cx + r * Math.cos(sa), iy2 = cy + r * Math.sin(sa);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${ix1},${iy1} A${r},${r},0,${large},0,${ix2},${iy2} Z`;
  }

  return (
    <div className={styles.donutWrap}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map((s, i) => (
          <path
            key={i}
            d={arc(CX, CY, R, r_inner, s.startAngle, s.endAngle)}
            fill={COLORS[s.type] ?? "#94a3b8"}
          />
        ))}
        <text x={CX} y={CY - 5} textAnchor="middle" className={styles.donutCenter}>
          {total.toLocaleString()}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" className={styles.donutSub}>
          total
        </text>
      </svg>
      <div className={styles.legend}>
        {slices.map((s, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: COLORS[s.type] ?? "#94a3b8" }} />
            <span>
              {s.type} —{" "}
              <strong>
                {s.pourcentage ??
                  (total > 0 ? Math.round((Number(s.nb) / total) * 100) : 0)}
                %
              </strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Force-batch button ────────────────────────────────────────────────────────
function ForceBatchButton({ onSuccess }) {
  const [busy,   setBusy]   = useState(false);
  const [status, setStatus] = useState(null); // null | "ok" | "err"
  const [msg,    setMsg]    = useState("");

  const handleClick = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await api.post(`${ANALYTICS}/force-batch`);
      setMsg(res.data ?? "Batch exécuté !");
      setStatus("ok");
      onSuccess?.();
    } catch (e) {
      setMsg(e.response?.data?.message ?? e.message ?? "Erreur batch");
      setStatus("err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.batchZone}>
      <button
        className={`${styles.btnBatch} ${busy ? styles.btnBatchBusy : ""}`}
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "⏳ En cours…" : "⚡ Forcer le batch Gold"}
      </button>
      {status === "ok"  && <span className={styles.batchOk}>✅ {msg}</span>}
      {status === "err" && <span className={styles.batchErr}>❌ {msg}</span>}
    </div>
  );
}

// ── Ratio table ───────────────────────────────────────────────────────────────
function RatioTable({ data }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, r) => s + Number(r.nb || 0), 0);

  return (
    <table className={styles.ratioTable}>
      <thead>
        <tr>
          <th>Type</th>
          <th>Nb transactions</th>
          <th>Pourcentage</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <td>
              <span className={styles.badge} data-type={r.type}>
                {r.type}
              </span>
            </td>
            <td>{Number(r.nb).toLocaleString()}</td>
            <td>
              <strong>
                {r.pourcentage ??
                  (total > 0 ? Math.round((Number(r.nb) / total) * 100) : 0)}
                %
              </strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuth();
  const warehouseId = user?.warehouseId ?? 1;
  const [jours, setJours] = useState(30);

  const { topSorties, topEntrees, ratioInOut, loading, error, refetch } =
    useAnalytics(warehouseId, jours);

  return (
    <section className={styles.page}>
      <PageHeader
        title="📊 Analytics Big Data"
        subtitle="Traitements Hive — vue Gold en temps différé"
      />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <label className={styles.toolbarLabel}>Période :</label>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            className={`${styles.chip} ${jours === d ? styles.chipActive : ""}`}
            onClick={() => setJours(d)}
          >
            {d}j
          </button>
        ))}
        <ForceBatchButton onSuccess={refetch} />
      </div>

      {/* States */}
      {loading && <p className={styles.loading}>⏳ Chargement des données Hive…</p>}
      {error   && <p className={styles.error}>❌ {error}</p>}

      {!loading && !error && (
        <>
          {/* ── Top 10 Entrées ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📦 Top 10 Produits les plus Entrés</h2>
            <div className={styles.card}>
              <BarChart
                data={topEntrees}
                valueKey="total"
                labelKey="productname"
                color="blue"
              />
            </div>
          </div>

          {/* ── Top 10 Sorties ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🚚 Top 10 Produits les plus Sortis</h2>
            <div className={styles.card}>
              <BarChart
                data={topSorties}
                valueKey="total"
                labelKey="productname"
                color="orange"
              />
            </div>
          </div>

          {/* ── Ratio IN / OUT ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>⚖️ Ratio IN vs OUT</h2>
            <div className={styles.card}>
              <div className={styles.twoCol}>
                <DonutChart data={ratioInOut} />
                <RatioTable data={ratioInOut} />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}