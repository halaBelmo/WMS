import styles from "./RackTable.module.css";

export default function RackTable({ racks, loading, deletingId, onEdit, onDelete, zoneName }) {
  if (loading) {
    return <p>Loading racks for {zoneName}...</p>;
  }

  return (
    <div className={styles.container}>
      <h4>Racks in {zoneName}</h4>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {racks.map((rack) => (
            <tr key={rack.id}>
              <td>{rack.code}</td>
            
              <td className={styles.actions}>
                <button onClick={() => onEdit(rack)} className={styles.editBtn}>
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(rack)} 
                  disabled={deletingId === rack.id}
                  className={styles.deleteBtn}
                >
                  {deletingId === rack.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {racks.length === 0 && !loading && (
        <p className={styles.empty}>No racks found in this zone.</p>
      )}
    </div>
  );
}

