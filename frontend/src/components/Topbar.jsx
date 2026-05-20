import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.name || "User";
  const userRole = (user?.role || "-").toUpperCase();
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.identity}>
        <span className={styles.avatar}>{initials || "U"}</span>
        <div>
          <p className={styles.welcome}>Welcome back, {userName}</p>
          <h2 className={styles.title}>WMS Panel</h2>
        </div>
      </div>

      <div className={styles.actions}>
        <span className={styles.badge}>{userRole}</span>
        <Button variant="outline" fullWidth={false} onClick={handleLogout}>
          <span className={styles.logoutIcon}>↪</span>
          Logout
        </Button>
      </div>
    </header>
  );
}
