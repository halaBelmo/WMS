package com.example.wms.controllers;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.services.AnalyticsBatchService;

@RestController
@CrossOrigin(origins = "*") // Permet les requêtes depuis n'importe quelle origine (ex: React local)
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    @Qualifier("hiveJdbcTemplate")
    private JdbcTemplate hive;

    // FIX : JdbcTemplate Postgres distinct du bean Hive
    // On le construit à partir du DataSource primaire (PostgresConfig)
    @Autowired
    @Qualifier("dataSource")
    private DataSource postgresDataSource;

    @Autowired
    private AnalyticsBatchService batchService;

    // ==========================================
    // 0. FORCE BATCH — admin déclenche manuellement
    // ==========================================
    @PostMapping("/force-batch")
    public ResponseEntity<String> forceBatchExecution() {
        batchService.runGoldAnalyticsPipeline();
        return ResponseEntity.ok("Batch exécuté avec succès ! Table Gold mise à jour.");
    }

    // ==========================================
    // A. Répartition des raisons (Pie Chart) — Hive
    // ==========================================
    @GetMapping("/{warehouseId}/raisons")
    public ResponseEntity<List<Map<String, Object>>> getMouvementsParRaison(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql = "SELECT movementReason as name, SUM(nb_transactions) as value " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND status = 'VALIDATED' " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY movementReason";

        return ResponseEntity.ok(hive.queryForList(sql));
    }
    @GetMapping("/{warehouseId}/dormant-products")
public ResponseEntity<List<Map<String, Object>>> getDormantProducts(
        @PathVariable int warehouseId,
        @RequestParam(defaultValue = "30") int jours) {

    String sql =
        "SELECT productName, " +
        "MAX(stat_date) as lastMovementDate, " +
        "DATEDIFF(current_date(), MAX(stat_date)) as daysWithoutMovement " +
        "FROM warehouse_analytics_gold " +
        "WHERE warehouseId = " + warehouseId + " " +
        "AND status = 'VALIDATED' " +
        "GROUP BY productName " +
        "HAVING DATEDIFF(current_date(), MAX(stat_date)) >= " + jours + " " +
        "ORDER BY daysWithoutMovement DESC " +
        "LIMIT 10";

    return ResponseEntity.ok(hive.queryForList(sql));
}
    // ==========================================
    // B. Top 10 Entrées (Bar Chart) — Hive
    // ==========================================
    @GetMapping("/{warehouseId}/top-entrees")
    public ResponseEntity<List<Map<String, Object>>> getTopEntrees(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

       String sql =
    "SELECT productname, SUM(total_qty) as total " +
    "FROM warehouse_analytics_gold " +
    "WHERE warehouseid = " + warehouseId + " " +
    "AND movementtype = 'IN' " +
    "AND status = 'VALIDATED' " +
    "AND stat_date >= date_sub(current_date(), " + jours + ") " +
    "GROUP BY productname " +
    "ORDER BY total DESC LIMIT 10";

        return ResponseEntity.ok(hive.queryForList(sql));
    }

    // ==========================================
    // C. Top 10 Sorties (Bar Chart) — Hive
    // ==========================================
    @GetMapping("/{warehouseId}/top-sorties")
    public ResponseEntity<List<Map<String, Object>>> getTopSorties(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql =
    "SELECT productname, SUM(total_qty) as total " +
    "FROM warehouse_analytics_gold " +
    "WHERE warehouseid = " + warehouseId + " " +
    "AND movementtype = 'OUT' " +
    "AND status = 'VALIDATED' " +
    "AND stat_date >= date_sub(current_date(), " + jours + ") " +
    "GROUP BY productname " +
    "ORDER BY total DESC LIMIT 10";

        return ResponseEntity.ok(hive.queryForList(sql));
    }

    // ==========================================
    // D. Vue Globale — Global KPI Dashboard
    // Requête Postgres temps réel (pas Hive) :
    // Hive ne reflète pas les validations faites après le dernier batch.
    // On interroge directement stock_movements en Postgres pour avoir
    // total / validated / rejected / pending à jour.
    // ==========================================
  
    // ==========================================
    // E. Ratio IN / OUT — Hive
    // ==========================================
    @GetMapping("/{warehouseId}/ratio-in-out")
    public ResponseEntity<List<Map<String, Object>>> getRatioInOut(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

    String sql =
    "SELECT movementtype AS type, " +
    "SUM(nb_transactions) AS nb, " +
    "ROUND(SUM(nb_transactions) * 100.0 / " +
    "      SUM(SUM(nb_transactions)) OVER (), 1) AS pourcentage " +
    "FROM warehouse_analytics_gold " +
    "WHERE warehouseid = " + warehouseId + " " +
    "AND movementtype IN ('IN', 'OUT') " +
    "AND status = 'VALIDATED' " +
    "AND stat_date >= date_sub(current_date(), " + jours + ") " +
    "GROUP BY movementtype";

        return ResponseEntity.ok(hive.queryForList(sql));
    }
}
