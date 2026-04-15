import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.welcome}>Welcome back</p>
        <h2 className={styles.title}>{user?.name || "User"}</h2>
      </div>

      <div className={styles.actions}>
        <span className={styles.badge}>{user?.role || "-"}</span>
        <Button variant="outline" fullWidth={false} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
