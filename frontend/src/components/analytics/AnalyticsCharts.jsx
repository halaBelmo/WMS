import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./AnalyticsCharts.module.css";

function EmptyChart({ message }) {
  return <div className={styles.empty}>{message}</div>;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function hasPositiveValues(data, yKey) {
  return data.some((row) => Number(row?.[yKey] || 0) > 0);
}

export function TopEntriesBarChart({ data, emptyMessage = "No entries data available." }) {
  if (!data.length) return <EmptyChart message={emptyMessage} />;
  if (!hasPositiveValues(data, "value")) return <EmptyChart message="No positive values to display for this chart." />;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 30, right: 30, left: 30, bottom: 50 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fill: "#334155", fontSize: 12 }} interval={0} />
        <YAxis domain={[0, "dataMax"]} allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <Tooltip formatter={(value) => [formatNumber(value), "Quantity"]} />
        <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={55} animationDuration={450} animationEasing="ease-out">
          <LabelList
            dataKey="value"
            position="top"
            offset={8}
            formatter={(value) => formatNumber(value)}
            style={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopExitsBarChart({ data, emptyMessage = "No exits data available." }) {
  if (!data.length) return <EmptyChart message={emptyMessage} />;
  if (!hasPositiveValues(data, "value")) return <EmptyChart message="No positive values to display for this chart." />;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 30, right: 30, left: 30, bottom: 50 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fill: "#334155", fontSize: 12 }} interval={0} />
        <YAxis domain={[0, "dataMax"]} allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <Tooltip formatter={(value) => [formatNumber(value), "Quantity"]} />
        <Bar dataKey="value" fill="#b45309" radius={[8, 8, 0, 0]} barSize={55} animationDuration={450} animationEasing="ease-out">
          <LabelList
            dataKey="value"
            position="top"
            offset={8}
            formatter={(value) => formatNumber(value)}
            style={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CustomerReturnsBarChart({ data, emptyMessage = "No customer returns data available." }) {
  if (!data.length) return <EmptyChart message={emptyMessage} />;
  if (!hasPositiveValues(data, "value")) return <EmptyChart message="No positive values to display for this chart." />;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis type="number" domain={[0, "dataMax"]} allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#334155", fontSize: 12 }} />
        <Tooltip formatter={(value) => [formatNumber(value), "Quantity"]} />
        <Bar dataKey="value" fill="#0f766e" radius={[0, 8, 8, 0]} barSize={30} animationDuration={450} animationEasing="ease-out">
          <LabelList
            dataKey="value"
            position="right"
            offset={6}
            formatter={(value) => formatNumber(value)}
            style={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReasonsDonutChart({ data }) {
  const colors = ["#1e3a8a", "#0f766e", "#b45309", "#475569", "#7c3aed", "#be123c"];
  if (!data.length) return <EmptyChart message="No reason data available for selected filters." />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={100}
          label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`reason-${entry.name}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [formatNumber(value), "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, xKey, yKey, color, emptyMessage, layout = "vertical" }) {
  if (!data.length) return <EmptyChart message={emptyMessage} />;
  if (!hasPositiveValues(data, yKey)) return <EmptyChart message="No positive values to display for this chart." />;

  const isHorizontal = layout === "horizontal";
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 30, right: 30, left: 20, bottom: 40 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} domain={[0, "auto"]} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: "#334155", fontSize: 12 }} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: "#334155", fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} domain={[0, "auto"]} />
          </>
        )}
        <Tooltip formatter={(value) => [formatNumber(value), "Value"]} />
        <Bar
          dataKey={yKey}
          fill={color}
          radius={[8, 8, 0, 0]}
          barSize={55}
          minPointSize={10}
          animationDuration={450}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey={yKey}
            position={isHorizontal ? "right" : "top"}
            offset={8}
            formatter={(value) => formatNumber(value)}
            style={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RatioChart({ data }) {
  if (!data.length) return <EmptyChart message="No IN/OUT ratio data available." />;
  const colors = { IN: "#1d4ed8", OUT: "#b45309" };
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="nb"
          nameKey="type"
          innerRadius={65}
          outerRadius={100}
          label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell key={`ratio-${entry.type}`} fill={colors[entry.type] || "#475569"} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [formatNumber(value), "Transactions"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
