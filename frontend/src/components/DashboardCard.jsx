import styles from "./DashboardCard.module.css";

export default function DashboardCard({ user }) {
  const items = [
    { label: "Name", value: user?.name || "-" },
    { label: "Email", value: user?.email || "-" },
    { label: "Role", value: user?.role || "-" },
    { label: "Company", value: user?.companyName || "-" },
    { label: "Warehouse", value: user?.warehouseName || "Not assigned" },
  ];

  return (
    <div className={styles.card}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
