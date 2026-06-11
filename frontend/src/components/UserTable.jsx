import Button from "./Button";
import styles from "./UserTable.module.css";

function ActionIcon({ type }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" };

  if (type === "edit") {
    return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>;
  }

  return <svg {...common}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>;
}

function roleClass(role) {
  return role === "ADMIN" ? styles.roleAdmin : styles.roleStaff;
}

export default function UserTable({ users, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <div className={styles.card}>Loading users...</div>;
  }

  if (!users.length) {
    return <div className={styles.card}>No users found.</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h3>Users Directory</h3>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Warehouse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <span className={styles.avatar}>{(user.name || "U").charAt(0).toUpperCase()}</span>
                    <div>
                      <p className={styles.userName}>{user.name}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${roleClass(user.role)}`}>{user.role}</span>
                </td>
                <td>
                  <span className={styles.warehouseBadge}>{user.warehouseName || "-"}</span>
                </td>
                <td className={styles.actions}>
                  <Button variant="outline" fullWidth={false} onClick={() => onEdit(user)}>
                    <ActionIcon type="edit" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth={false}
                    disabled={deletingId === user.id}
                    onClick={() => onDelete(user)}
                  >
                    <ActionIcon type="delete" />
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
