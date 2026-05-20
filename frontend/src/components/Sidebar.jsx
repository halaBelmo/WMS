import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { role } = useAuth();
  const renderIcon = (icon) => {
    const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" };

    switch (icon) {
      case "dashboard":
        return <svg {...common}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="5" /><rect x="13" y="10" width="8" height="11" /><rect x="3" y="13" width="8" height="8" /></svg>;
      case "users":
        return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
      case "stock":
        return <svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>;
      case "movement":
        return <svg {...common}><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>;
      case "customers":
        return <svg {...common}><circle cx="8" cy="8" r="4" /><path d="M2 21a6 6 0 0 1 12 0" /><circle cx="17" cy="7" r="3" /><path d="M22 21a5 5 0 0 0-8-4" /></svg>;
      case "zones":
        return <svg {...common}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
      case "racks":
        return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M4 15h16" /></svg>;
      case "shelves":
        return <svg {...common}><path d="M5 4h14M5 10h14M5 16h14M5 22h14" /><path d="M7 4v18M17 4v18" /></svg>;
      case "locations":
        return <svg {...common}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
      case "analytics":
        return <svg {...common}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>;
      default:
        return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
    }
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["OWNER", "ADMIN", "MAGASINIER"] },
    { to: "/warehouses", label: "Warehouses", icon: "zones", roles: ["OWNER"] },
    { to: "/users", label: "Users", icon: "users", roles: ["OWNER", "ADMIN"] },
    { to: "/suppliers", label: "Suppliers", icon: "movement", roles: ["OWNER"] },
    { to: "/products", label: "Products", icon: "stock", roles: ["OWNER"] },
    { to: "/stocks", label: "Stocks", icon: "stock", roles: ["ADMIN"] },
    { to: "/movements", label: "Movements", icon: "movement", roles: ["ADMIN", "MAGASINIER"] },
    { to: "/customers", label: "Customers", icon: "customers", roles: ["ADMIN"] },
    { to: "/structure", label: "Structure", icon: "zones", roles: ["ADMIN"] },
    { to: "/analytics", label: "Analytics", icon: "analytics", roles: ["OWNER", "ADMIN"] },
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
            <span className={styles.icon}>{renderIcon(link.icon)}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
