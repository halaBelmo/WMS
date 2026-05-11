package com.example.wms.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsBatchService {

    @Autowired
    @Qualifier("hiveJdbcTemplate")
    private JdbcTemplate hive;

    // ==========================================
    // Batch nuit — recalcul complet table Gold
    // ==========================================
    @Scheduled(cron = "0 0 1 * * *")
    public void runGoldAnalyticsPipeline() {
        System.out.println("Début du calcul de la table GOLD...");

        // INSERT OVERWRITE repart de zéro → efface aussi les lignes correctives
        // de la journée, ce qui est correct car on recalcule tout depuis Postgres
        String sql =
            "INSERT OVERWRITE TABLE warehouse_analytics_gold " +
            "SELECT " +
            "  warehouseId, " +
            "  cast(createdAt as date) as stat_date, " +
            "  productId, " +
            "  productName, " +
            "  movementType, " +
            "  movementReason, " +
            "  status, " +
            "  SUM(quantity), " +
            "  SUM(quantity * 15.0), " +
            "  COUNT(*) " +
            "FROM stock_movements " +
            "GROUP BY warehouseId, cast(createdAt as date), productId, productName, " +
            "         movementType, movementReason, status";

        try {
            hive.execute(sql);
            System.out.println("Table GOLD mise à jour avec succès.");
        } catch (Exception e) {
            System.err.println("Erreur lors du batch Hive : " + e.getMessage());
        }
    }

    
}