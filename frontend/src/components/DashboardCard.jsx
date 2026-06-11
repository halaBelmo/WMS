import { useAuth } from "../context/AuthContext";
import styles from "./DashboardCard.module.css";

const ICONS = {
  Name: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
  ),
  Email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
  ),
  Role: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.3-5.5-3-5.5 3 1-6.3L3 9.9 9 9z" /></svg>
  ),
  Company: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" /></svg>
  ),
  Warehouse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10 12 4l9 6" /><path d="M4 10v10h16V10" /><path d="M9 20v-6h6v6" /></svg>
  ),
};

export default function DashboardCard() {
  const { user } = useAuth();

  const items = [
    { label: "Name", value: user?.name || "-" },
    { label: "Email", value: user?.email || "-" },
    { label: "Role", value: user?.role || "-" },
    { label: "Company", value: user?.companyName || "-" },
    { label: "Warehouse", value: user?.warehouseName || "Not assigned" },
  ];

  return (
    <section className={styles.wrapper}>
      {items.map((item) => (
        <article key={item.label} className={styles.itemCard}>
          <span className={styles.icon}>{ICONS[item.label]}</span>
          <p className={styles.label}>{item.label}</p>
          <p className={styles.value}>{item.value}</p>
        </article>
      ))}
    </section>
  );
}
