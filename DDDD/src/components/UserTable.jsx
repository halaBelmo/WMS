import Button from "./Button";
import styles from "./UserTable.module.css";

export default function UserTable({ users, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <div className={styles.card}>Loading users...</div>;
  }

  if (!users.length) {
    return <div className={styles.card}>No users found.</div>;
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Warehouse</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.warehouseName || "-"}</td>
              <td className={styles.actions}>
                <Button variant="outline" fullWidth={false} onClick={() => onEdit(user)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  fullWidth={false}
                  disabled={deletingId === user.id}
                  onClick={() => onDelete(user)}
                >
                  {deletingId === user.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
