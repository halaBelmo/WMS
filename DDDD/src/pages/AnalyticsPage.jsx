import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import styles from "./AnalyticsPage.module.css";
import api from "../services/api"; // ✅ FIX 1 : utiliser api.js qui injecte le JWT

const ANALYTICS = "/api/analytics";

// ── helpers ──────────────────────────────────────────────────────────────────
function useAnalytics(warehouseId, jours) {
  const [topSorties, setTopSorties] = useState([]);
  const [topEntrees, setTopEntrees] = useState([]);
  const [ratioInOut, setRatioInOut] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);

    // ✅ FIX 2 : api.get() au lieu de fetch() brut → le JWT est envoyé automatiquement
    Promise.all([
      api.get(`${ANALYTICS}/${warehouseId}/top-sorties?jours=${jours}`),
            api.get(`${ANALYTICS}/${warehouseId}/top-entrees?jours=${jours}`),

      api.get(`${ANALYTICS}/${warehouseId}/ratio-in-out?jours=${jours}`),
    ])
      .then(([sortiesRes, entreesRes, ratioRes]) => {
        setTopSorties(sortiesRes.data ?? []);
        setTopEntrees(entreesRes.data ?? []);
        // ✅ FIX 3 : protéger contre null retourné par Hive si aucune donnée
        setRatioInOut(ratioRes.data ?? []);
      })
      .catch((e) => {
        // ✅ FIX 4 : message d'erreur plus précis (axios expose e.response)
        const msg =
          e.response?.status === 401
            ? "Non autorisé — vérifiez votre connexion"
            : e.response?.data?.message ?? e.message;
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [warehouseId, jours]);

return { topSorties, topEntrees, ratioInOut, loading, error };}

// ── Mini bar chart (SVG, no lib needed) ─────────────────────────────────────
function BarChart({ data, valueKey = "total", labelKey = "productname" }) {
  if (!data.length) return <p className={styles.empty}>Aucune donnée</p>;
  const max = Math.max(...data.map((d) => Number(d[valueKey])));

  return (
    <div className={styles.barChart}>
      {data.map((item, i) => {
        const pct = Math.round((Number(item[valueKey]) / max) * 100);
        return (
          <div key={i} className={styles.barRow}>
            <span className={styles.barLabel} title={item[labelKey]}>
              {item[labelKey]}
            </span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={styles.barValue}>{Number(item[valueKey]).toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ data }) {
  if (!data.length) return <p className={styles.empty}>Aucune donnée</p>;

  const COLORS = { IN: "#3b82f6", OUT: "#f97316", TRANSFER: "#8b5cf6" };
  const total = data.reduce((s, d) => s + Number(d.nb), 0);
  const R = 60;
  const CX = 80;
  const CY = 80;
  const r_inner = 35;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (Number(d.nb) / total) * 2 * Math.PI;
    const slice = { ...d, startAngle, endAngle: startAngle + angle };
    startAngle += angle;
    return slice;
  });

  function arc(cx, cy, R, r, sa, ea) {
    const x1 = cx + R * Math.cos(sa);
    const y1 = cy + R * Math.sin(sa);
    const x2 = cx + R * Math.cos(ea);
    const y2 = cy + R * Math.sin(ea);
    const ix1 = cx + r * Math.cos(ea);
    const iy1 = cy + r * Math.sin(ea);
    const ix2 = cx + r * Math.cos(sa);
    const iy2 = cy + r * Math.sin(sa);
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
          {total}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" className={styles.donutSub}>
          total
        </text>
      </svg>
      <div className={styles.legend}>
        {slices.map((s, i) => (
          <div key={i} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: COLORS[s.type] ?? "#94a3b8" }}
            />
            <span>
              {s.type} — <strong>{s.pourcentage ?? Math.round((Number(s.nb) / total) * 100)}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuth();

  const warehouseId = user?.warehouseId ?? 1;
  const [jours, setJours] = useState(30);

  const { topSorties, topEntrees,ratioInOut, loading, error } = useAnalytics(warehouseId, jours);

  return (
    <section className={styles.page}>
      <PageHeader
        title="📊 Analytics Big Data"
        subtitle="Traitements Hive — vue Gold en temps différé"
      />

      {/* Filtre période */}
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
      </div>

      {loading && <p className={styles.loading}>⏳ Chargement des données Hive…</p>}
      {error && <p className={styles.error}>❌ Erreur : {error}</p>}

      {!loading && !error && (
        <>
          {/* ── C. Top 10 Sorties ─────────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Top 10 Produits les plus Sortis</h2>
            <div className={styles.card}>
              <BarChart data={topEntrees} valueKey="total" labelKey="productname" />
            </div>
          </div>

          {/* ── C. Top 10 Sorties ─────────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Top 10 Produits les plus Sortis</h2>
            <div className={styles.card}>
              <BarChart data={topSorties} valueKey="total" labelKey="productname" />
            </div>
          </div>

          {/* ── E. Ratio IN / OUT ─────────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Ratio IN vs OUT</h2>
            <div className={styles.card}>
              <DonutChart data={ratioInOut} />

              {ratioInOut.length > 0 && (
                <table className={styles.ratioTable}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Nb transactions</th>
                      <th>Pourcentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratioInOut.map((r, i) => (
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
                              Math.round(
                                (Number(r.nb) /
                                  ratioInOut.reduce((s, x) => s + Number(x.nb), 0)) *
                                  100
                              )}
                            %
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}