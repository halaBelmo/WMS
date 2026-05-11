import styles from "./ZoneTable.module.css";

export default function ZoneTable({ zones, loading, deletingId, onEdit, onDelete }) {
  if (loading) {
    return <p>Loading zones...</p>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Warehouse</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <td>{zone.id}</td>
              <td>{zone.name}</td>
              <td>{zone.warehouseName}</td>
              <td className={styles.actions}>
                <button onClick={() => onEdit(zone)} className={styles.editBtn}>
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(zone)} 
                  disabled={deletingId === zone.id}
                  className={styles.deleteBtn}
                >
                  {deletingId === zone.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {zones.length === 0 && !loading && (
        <p className={styles.empty}>No zones found.</p>
      )}
    </div>
  );
}

