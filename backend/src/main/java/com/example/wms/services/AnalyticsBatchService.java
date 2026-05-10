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

    /**
     * S'exécute chaque nuit à 01h00 du matin.
     * Calcule toutes les dimensions pour la table Gold.
     */
    @Scheduled(cron = "0 0 1 * * *")
   public void runGoldAnalyticsPipeline() {
    System.out.println("Début du calcul de la table GOLD...");

    // ✅ INSERT OVERWRITE = vide + réécrit en une seule opération (supporté par Hive sans ACID)
    String sql =
        "INSERT OVERWRITE TABLE warehouse_analytics_gold " +
        "SELECT " +
        "  warehouseId, " +
        "  cast(createdAt as date) as stat_date, " +
        "  productId, " +
        "  'Product_' || cast(productId as string), " +
        "  movementType, " +
        "  movementReason, " +
        "  status, " +
        "  SUM(quantity), " +
        "  SUM(quantity * 15.0), " +
        "  COUNT(*) " +
        "FROM stock_movements " +
        "GROUP BY warehouseId, cast(createdAt as date), productId, movementType, movementReason, status";

    try {
        hive.execute(sql);
        System.out.println("Table GOLD mise à jour avec succès.");
    } catch (Exception e) {
        System.err.println("Erreur lors du batch Hive : " + e.getMessage());
    }
}
}