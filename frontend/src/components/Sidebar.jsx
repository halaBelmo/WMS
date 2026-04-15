import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { role } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", roles: ["OWNER", "ADMIN", "MAGASINIER", "RESPONSABLE_STOCK"] },
    { to: "/warehouses", label: "Warehouses", roles: ["OWNER"] },
    { to: "/users", label: "Users", roles: ["OWNER", "ADMIN"] },
    { to: "/products", label: "Products", roles: ["ADMIN"] },
    { to: "/locations", label: "Locations", roles: ["OWNER", "ADMIN"] },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>WMS Panel</div>
      <nav className={styles.nav}>
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
