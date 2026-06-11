import DashboardCard from "../components/DashboardCard";
import WarehouseTree from "../components/WarehouseTree";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  return (
    <section className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.badge}>WMS Admin Panel</div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of your warehouse, company, and account activity.
        </p>
      </section>

      <DashboardCard />
      <WarehouseTree />
    </section>
  );
}
