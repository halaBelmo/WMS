import styles from "./ShelfTable.module.css";

export default function ShelfTable({ shelves, loading, deletingId, onEdit, onDelete, rackCode }) {
  if (loading) {
    return <p>Loading shelves for rack {rackCode}...</p>;
  }

  return (
    <div className={styles.container}>
      <h4>Shelves in Rack {rackCode}</h4>
      <table className={styles.table}>
        <thead>
          <tr>
            
            <th>Code</th>
            <th>Rack</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shelves.map((shelf) => (
            <tr key={shelf.id}>
              
              <td>{shelf.code}</td>
              <td>{shelf.rackCode}</td>
              <td className={styles.actions}>
                <button onClick={() => onEdit(shelf)} className={styles.editBtn}>
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(shelf)} 
                  disabled={deletingId === shelf.id}
                  className={styles.deleteBtn}
                >
                  {deletingId === shelf.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shelves.length === 0 && !loading && (
        <p className={styles.empty}>No shelves found in this rack.</p>
      )}
    </div>
  );
}

