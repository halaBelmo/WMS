package com.example.wms.controllers;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.services.AnalyticsBatchService;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin("*")
public class AnalyticsController {

    @Autowired
    @Qualifier("hiveJdbcTemplate")
    private JdbcTemplate hive;

    // ✅ FIX 1 : injecter le datasource Postgres pour les requêtes non-Hive
    // ✅ FIX 1 : le bean Postgres primaire s'appelle "dataSource" dans PostgresConfig
    @Autowired
    @Qualifier("dataSource")
    private DataSource postgresDataSource;

    @Autowired
    private AnalyticsBatchService batchService;

    // ==========================================
    // 0. FORCE BATCH (dev/test)
    // ==========================================
    @PostMapping("/force-batch")
    public ResponseEntity<String> forceBatchExecution() {
        batchService.runGoldAnalyticsPipeline();
        return ResponseEntity.ok("Batch exécuté avec succès ! Vérifie ta table Gold.");
    }

    // ==========================================
    // A. Répartition des raisons (Pie Chart)
    // ==========================================
    @GetMapping("/{warehouseId}/raisons")
    public ResponseEntity<List<Map<String, Object>>> getMouvementsParRaison(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql = "SELECT movementReason as name, SUM(nb_transactions) as value " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY movementReason";

        // ✅ FIX 2 : retourner ResponseEntity pour éviter les corps vides
        return ResponseEntity.ok(hive.queryForList(sql));
    }

    // ==========================================
    // B. Top 10 Entrées (Bar Chart)
    // ==========================================
    @GetMapping("/{warehouseId}/top-entrees")
    public ResponseEntity<List<Map<String, Object>>> getTopEntrees(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql = "SELECT productName, SUM(total_qty) as total " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND movementType = 'IN' " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY productName " +
                "ORDER BY total DESC LIMIT 10";

        return ResponseEntity.ok(hive.queryForList(sql));
    }

    // ==========================================
    // C. Top 10 Produits les plus SORTIS
    // ==========================================
    @GetMapping("/{warehouseId}/top-sorties")
    public ResponseEntity<List<Map<String, Object>>> getTopSorties(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql = "SELECT productName, SUM(total_qty) as total " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND movementType = 'OUT' " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY productName " +
                "ORDER BY total DESC LIMIT 10";

        return ResponseEntity.ok(hive.queryForList(sql));
    }

    // ==========================================
    // D. Vue Globale des Mouvements (Global KPI)
    // ✅ Requête Postgres en temps réel — Hive ne reflète pas les validations faites après le batch
    // ==========================================
    

    // ==========================================
    // E. Ratio IN / OUT
    // ==========================================
    @GetMapping("/{warehouseId}/ratio-in-out")
    public ResponseEntity<List<Map<String, Object>>> getRatioInOut(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql = "SELECT " +
                "  movementType AS type, " +
                "  SUM(nb_transactions) AS nb, " +
                "  ROUND(SUM(nb_transactions) * 100.0 / " +
                "        SUM(SUM(nb_transactions)) OVER (), 1) AS pourcentage " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND movementType IN ('IN', 'OUT') " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY movementType";

        return ResponseEntity.ok(hive.queryForList(sql));
    }

    // ==========================================
    // P. Produits qui Dorment (> 1 mois sans mouvement)
    // ==========================================
    
}