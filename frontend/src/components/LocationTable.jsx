import Button from "./Button";
import styles from "./LocationTable.module.css";

export default function LocationTable({ locations, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <div className={styles.card}>Loading locations...</div>;
  }

  if (!locations.length) {
    return <div className={styles.card}>No locations found.</div>;
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Zone</th>
            <th>Rack</th>
            <th>Etager</th>
            <th>Warehouse ID</th>
            <th>Warehouse Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <td>{location.name}</td>
              <td>{location.zone || "-"}</td>
              <td>{location.rack || "-"}</td>
              <td>{location.etager || "-"}</td>
              <td>{location.warehouseId}</td>
              <td>{location.warehouseName}</td>
              <td className={styles.actions}>
                <Button variant="outline" fullWidth={false} onClick={() => onEdit(location)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  fullWidth={false}
                  disabled={deletingId === location.id}
                  onClick={() => onDelete(location)}
                >
                  {deletingId === location.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
