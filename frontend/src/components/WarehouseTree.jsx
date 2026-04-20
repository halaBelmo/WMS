import styles from "./WarehouseTree.module.css";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function WarehouseTree() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTree = async () => {
      try {
        const warehousesRes = await api.get("/api/owner/warehouses");
        const warehouses = warehousesRes.data || [];
        
        const fullTree = await Promise.all(warehouses.map(async (warehouse) => {
          const zonesRes = await api.get("/api/zones");
          const zones = zonesRes.data.filter(z => z.warehouseId === warehouse.id) || [];
          
          const zonesWithChildren = await Promise.all(zones.map(async (zone) => {
            const racksRes = await api.get(`/api/racks?zoneId=${zone.id}`);
            const racks = racksRes.data || [];
            
            const racksWithChildren = await Promise.all(racks.map(async (rack) => {
              const shelvesRes = await api.get(`/api/shelves?rackId=${rack.id}`);
              const shelves = shelvesRes.data || [];
              
              const shelvesWithChildren = await Promise.all(shelves.map(async (shelf) => {
                const locationsRes = await api.get(`/api/locations/shelf/${shelf.id}`);
                const locations = locationsRes.data || [];
                
                const locationsWithChildren = await Promise.all(locations.map(async (location) => {
                  const productsRes = await api.get("/api/products");
                  const products = productsRes.data.filter(p => p.locationId === location.id) || [];
                  return {
                    name: location.name,
                    type: "location",
                    products: products.map(p => p.name)
                  };
                }));
                
                return {
                  name: shelf.name || `Shelf ${shelf.code}`,
                  type: "shelf",
                  locations: locationsWithChildren
                };
              }));
              
              return {
                name: rack.code,
                type: "rack",
                shelves: shelvesWithChildren
              };
            }));
            
            return {
              name: zone.name,
              type: "zone",
              racks: racksWithChildren
            };
          }));
          
          return {
            name: warehouse.name,
            type: "warehouse",
            zones: zonesWithChildren
          };
        }));
        
        setTreeData(fullTree);
      } catch (error) {
        console.error("Failed to load warehouse tree:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTree();
  }, []);

  if (loading) return <div>Loading hierarchy...</div>;

  const renderTree = (node) => (
    <div className={styles.treeNode}>
      <div className={styles.nodeLabel}>
        {node.name} ({node.products?.length || node.locations?.length || node.shelves?.length || node.racks?.length || node.zones?.length || 0} items)
      </div>
      {node.zones && node.zones.map((zone, i) => (
        <div key={i} className={styles.branch}>
          <span className={styles.branchLine}>│</span>
          <span className={styles.branchConnector}>└── </span>
          {renderTree(zone)}
        </div>
      ))}
      {node.racks && node.racks.map((rack, i) => (
        <div key={i} className={styles.branch}>
          <span className={styles.branchLine}>│</span>
          <span className={styles.branchConnector}>└── </span>
          {renderTree(rack)}
        </div>
      ))}
      {node.shelves && node.shelves.map((shelf, i) => (
        <div key={i} className={styles.branch}>
          <span className={styles.branchLine}>│</span>
          <span className={styles.branchConnector}>└── </span>
          {renderTree(shelf)}
        </div>
      ))}
      {node.locations && node.locations.map((location, i) => (
        <div key={i} className={styles.branch}>
          <span className={styles.branchLine}>│</span>
          <span className={styles.branchConnector}>└── </span>
          {renderTree(location)}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <h3>Warehouse Hierarchy</h3>
      {treeData.map((warehouse, i) => renderTree(warehouse))}
    </div>
  );
}

