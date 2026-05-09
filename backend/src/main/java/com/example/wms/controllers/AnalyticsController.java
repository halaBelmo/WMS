package com.example.wms.controllers;

import com.example.wms.services.AnalyticsBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin("*") // TRÈS IMPORTANT pour autoriser React (localhost:3000) à lire les données
public class AnalyticsController {

    @Autowired
    @Qualifier("hiveJdbcTemplate")
    private JdbcTemplate hive;

    @Autowired
    private AnalyticsBatchService batchService;

    // ==========================================
    // 1. BOUTON DE TEST (Pour toi pendant le dév)
    // ==========================================
    @PostMapping("/force-batch")
    public ResponseEntity<String> forceBatchExecution() {
        batchService.runGoldAnalyticsPipeline();
        return ResponseEntity.ok("Batch exécuté avec succès ! Vérifie ta table Gold.");
    }

    // ==========================================
    // 2. ENDPOINTS POUR REACT (Les graphiques)
    // ==========================================

    // Exemple pour l'Analyse A : Répartition des raisons (Pie Chart)
    @GetMapping("/{warehouseId}/raisons")
    public List<Map<String, Object>> getMouvementsParRaison(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) { // Par défaut 1 mois (30 jours)

        String sql = "SELECT movementReason as name, SUM(nb_transactions) as value " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY movementReason";

        return hive.queryForList(sql);
    }

    // Exemple pour l'Analyse B : Top 10 Entrées (Bar Chart)
    @GetMapping("/{warehouseId}/top-entrees")
    public List<Map<String, Object>> getTopEntrees(
            @PathVariable int warehouseId,
            @RequestParam(defaultValue = "30") int jours) {

        String sql = "SELECT productName, SUM(total_qty) as total " +
                "FROM warehouse_analytics_gold " +
                "WHERE warehouseId = " + warehouseId + " " +
                "AND movementType = 'IN' " +
                "AND stat_date >= date_sub(current_date(), " + jours + ") " +
                "GROUP BY productName " +
                "ORDER BY total DESC LIMIT 10";

        return hive.queryForList(sql);
    }
}