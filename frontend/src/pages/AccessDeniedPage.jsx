import { Link } from "react-router-dom";
import styles from "./AccessDeniedPage.module.css";

export default function AccessDeniedPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1>Access denied</h1>
        <p>You do not have permission to open this page.</p>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    </section>
  );
}
