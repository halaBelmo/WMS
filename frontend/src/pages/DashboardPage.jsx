import DashboardCard from "../components/DashboardCard";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className={styles.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your connected account information."
      />
      <DashboardCard user={user} />
    </section>
  );
}
