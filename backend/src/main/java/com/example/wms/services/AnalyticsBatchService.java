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

        // Requête SQL de transformation (ELT)
        // Note : On multiplie la quantité par une valeur (ex: 15.0) pour l'analyse financière (C)
        // Si tu as une table de prix, tu pourras faire un JOIN ici plus tard.
        String sql =
                "INSERT INTO warehouse_analytics_gold " +
                        "SELECT " +
                        "  warehouseId, " +
                        "  cast(createdAt as date) as stat_date, " +
                        "  productId, " +
                        "  'Product_' || cast(productId as string), " + // Placeholder pour le nom
                        "  movementType, " +
                        "  movementReason, " +
                        "  status, " +
                        "  SUM(quantity), " +
                        "  SUM(quantity * 15.0), " +
                        "  COUNT(*) " +
                        "FROM stock_movements " +
                       //  "WHERE cast(createdAt as date) = date_sub(current_date(), 1) " + // On traite uniquement 'hier'
                        "GROUP BY warehouseId, cast(createdAt as date), productId, movementType, movementReason, status";

        try {
            hive.execute(sql);
            System.out.println("Table GOLD mise à jour avec succès pour la journée précédente.");
        } catch (Exception e) {
            System.err.println("Erreur lors du batch Hive : " + e.getMessage());
        }
    }
}