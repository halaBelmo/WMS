import styles from "./WarehouseTree.module.css";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getChildren(node) {
  if (node.type === "warehouse") return node.zones || [];
  if (node.type === "zone") return node.racks || [];
  if (node.type === "rack") return node.shelves || [];
  if (node.type === "shelf") return node.locations || [];
  return [];
}

function childLabel(type) {
  if (type === "warehouse") return "zones";
  if (type === "zone") return "racks";
  if (type === "rack") return "shelves";
  if (type === "shelf") return "locations";
  return "items";
}

function HierarchyIcon({ type }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "warehouse":
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
        </svg>
      );
    case "zone":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "rack":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 9h16M4 15h16" />
        </svg>
      );
    case "shelf":
      return (
        <svg {...common}>
          <path d="M5 4h14M5 10h14M5 16h14M5 22h14" />
          <path d="M7 4v18M17 4v18" />
        </svg>
      );
    case "location":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function Chevron({ expanded }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return expanded ? (
    <svg {...common}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function countSummary(treeData) {
  const summary = {
    warehouses: treeData.length,
    zones: 0,
    racks: 0,
    shelves: 0,
    locations: 0,
  };

  treeData.forEach((warehouse) => {
    const zones = warehouse.zones || [];
    summary.zones += zones.length;

    zones.forEach((zone) => {
      const racks = zone.racks || [];
      summary.racks += racks.length;

      racks.forEach((rack) => {
        const shelves = rack.shelves || [];
        summary.shelves += shelves.length;

        shelves.forEach((shelf) => {
          summary.locations += (shelf.locations || []).length;
        });
      });
    });
  });

  return summary;
}

function TreeNode({ node, path, expandedMap, onToggle, level = 0 }) {
  const children = getChildren(node);
  const hasChildren = children.length > 0;
  const expanded = expandedMap[path] ?? level < 2;

  return (
    <div className={styles.nodeWrap}>
      <button
        type="button"
        className={`${styles.nodeButton} ${hasChildren ? "" : styles.leaf}`}
        onClick={() => hasChildren && onToggle(path)}
      >
        <span className={styles.chevron}>
          {hasChildren ? <Chevron expanded={expanded} /> : null}
        </span>
        <span className={styles.icon}>
          <HierarchyIcon type={node.type} />
        </span>
        <span className={styles.name}>{node.name}</span>
        <span className={styles.countBadge}>
          {children.length} {childLabel(node.type)}
        </span>
      </button>

      {hasChildren && expanded ? (
        <div className={styles.children}>
          {children.map((child, index) => (
            <TreeNode
              key={`${path}-${child.type}-${child.name}-${index}`}
              node={child}
              path={`${path}-${index}`}
              expandedMap={expandedMap}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function WarehouseTree() {
  const { role, user } = useAuth();
  const currentWarehouseId = String(user?.warehouseId ?? user?.warehouse?.id ?? "");
  const shouldScopeToUserWarehouse = role === "ADMIN" || role === "MAGASINIER";

  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMap, setExpandedMap] = useState({});

  useEffect(() => {
    const loadTree = async () => {
      try {
        const warehousesRes = await api.get("/api/owner/warehouses");
        const warehouses = extractList(warehousesRes.data);
        const visibleWarehouses = shouldScopeToUserWarehouse
          ? currentWarehouseId
            ? warehouses.filter((warehouse) => String(warehouse.id) === currentWarehouseId)
            : []
          : warehouses;

        let allZones = [];
        try {
          const zonesRes = await api.get("/api/zones");
          allZones = extractList(zonesRes.data);
        } catch {
          allZones = [];
        }

        const fullTree = await Promise.all(
          visibleWarehouses.map(async (warehouse) => {
            const zones = allZones.filter(
              (z) => String(z.warehouseId ?? z.warehouse?.id ?? "") === String(warehouse.id)
            );

            const zonesWithChildren = await Promise.all(
              zones.map(async (zone) => {
                let racks = [];
                try {
                  const racksRes = await api.get(`/api/racks?zoneId=${zone.id}`);
                  racks = extractList(racksRes.data);
                } catch {
                  racks = [];
                }

                const racksWithChildren = await Promise.all(
                  racks.map(async (rack) => {
                    let shelves = [];
                    try {
                      const shelvesRes = await api.get(`/api/shelves?rackId=${rack.id}`);
                      shelves = extractList(shelvesRes.data);
                    } catch {
                      shelves = [];
                    }

                    const shelvesWithChildren = await Promise.all(
                      shelves.map(async (shelf) => {
                        let locations = [];
                        try {
                          const locationsRes = await api.get(`/api/locations/shelf/${shelf.id}`);
                          locations = extractList(locationsRes.data);
                        } catch {
                          locations = [];
                        }

                        const locationsWithChildren = locations.map((location) => ({
                          name: location.name,
                          type: "location",
                        }));

                        return {
                          name: shelf.name || `Shelf ${shelf.code}`,
                          type: "shelf",
                          locations: locationsWithChildren,
                        };
                      })
                    );

                    return {
                      name: rack.code,
                      type: "rack",
                      shelves: shelvesWithChildren,
                    };
                  })
                );

                return {
                  name: zone.name,
                  type: "zone",
                  racks: racksWithChildren,
                };
              })
            );

            return {
              name: warehouse.name,
              type: "warehouse",
              zones: zonesWithChildren,
            };
          })
        );

        setTreeData(fullTree);
      } catch (error) {
        console.error("Failed to load warehouse tree:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTree();
  }, [shouldScopeToUserWarehouse, currentWarehouseId]);

  const summary = countSummary(treeData);
  const hierarchyRoots =
    role === "OWNER"
      ? treeData
      : treeData.flatMap((warehouse) => warehouse.zones || []);

  const toggleNode = (path) => {
    setExpandedMap((prev) => ({ ...prev, [path]: !(prev[path] ?? true) }));
  };

  if (loading) {
    return <div className={styles.container}>Loading hierarchy...</div>;
  }

  return (
    <section className={styles.container}>
      <div className={styles.summaryGrid}>
        <article className={`${styles.summaryCard} ${styles.blue}`}><p>Total Warehouses</p><h4>{summary.warehouses}</h4></article>
        <article className={`${styles.summaryCard} ${styles.green}`}><p>Total Zones</p><h4>{summary.zones}</h4></article>
        <article className={`${styles.summaryCard} ${styles.purple}`}><p>Total Racks</p><h4>{summary.racks}</h4></article>
        <article className={`${styles.summaryCard} ${styles.blue}`}><p>Total Shelves</p><h4>{summary.shelves}</h4></article>
        <article className={`${styles.summaryCard} ${styles.green}`}><p>Total Locations</p><h4>{summary.locations}</h4></article>
      </div>

      <div className={styles.treeCard}>
        <h3 className={styles.title}>Warehouse Hierarchy</h3>
        <div className={styles.treeBody}>
          {hierarchyRoots.map((node, index) => (
            <TreeNode
              key={`node-${node.type}-${node.name}-${index}`}
              node={node}
              path={`node-${index}`}
              expandedMap={expandedMap}
              onToggle={toggleNode}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
