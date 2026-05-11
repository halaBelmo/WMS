import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { role } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", roles: ["OWNER", "ADMIN", "MAGASINIER"] },
    { to: "/warehouses", label: "Warehouses", roles: ["OWNER"] },
    { to: "/users", label: "Users", roles: ["OWNER", "ADMIN"] },
    { to: "/suppliers", label: "Suppliers", roles: ["OWNER"] },
    { to: "/products", label: "Products", roles: ["OWNER"] },
    { to: "/stocks", label: "Stocks", roles: ["ADMIN"] },
    { to: "/movements", label: "Movements", roles: ["ADMIN", "MAGASINIER"] },
    { to: "/customers", label: "Customers", roles: ["ADMIN"] },
    { to: "/zones", label: "Zones", roles: ["ADMIN"] },
    { to: "/racks", label: "Racks", roles: ["ADMIN"] },
    { to: "/shelves", label: "Shelves", roles: ["ADMIN"] },
    { to: "/locations", label: "Locations", roles: ["ADMIN"] },
    { to: "/analytics", label: "📊 Analytics", roles: ["OWNER", "ADMIN"] },
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
