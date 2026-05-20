package com.example.wms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.entities.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByLocationId(Long locationId);

    List<Stock> findByProductId(Long productId);

    @Query("""
        SELECT s FROM Stock s
        JOIN s.product p
        JOIN s.location l
        LEFT JOIN p.supplier sup
        LEFT JOIN l.shelf sh
        LEFT JOIN sh.rack r
        LEFT JOIN r.zone z
        LEFT JOIN l.warehouse w
        WHERE p.company.id = :companyId
        AND (:productName IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%')))
        AND (:supplierId IS NULL OR sup.id = :supplierId)
        AND (:warehouseId IS NULL OR w.id = :warehouseId)
        AND (:zoneId IS NULL OR z.id = :zoneId)
        AND (:rackId IS NULL OR r.id = :rackId)
        AND (:shelfId IS NULL OR sh.id = :shelfId)
    """)
    List<Stock> searchStocks(
            Long companyId,
            String productName,
            Long supplierId,
            Long warehouseId,
            Long zoneId,
            Long rackId,
            Long shelfId
    );

    @Query("""
        SELECT s FROM Stock s
        JOIN s.product p
        JOIN s.location l
        WHERE p.company.id = :companyId
        AND l.warehouse IS NOT NULL
        AND s.quantity > 0
    """)
    List<Stock> findAvailableStocksByCompanyId(Long companyId);

    Optional<Stock> findByProductIdAndLocationId(Long productId, Long locationId);
    @Transactional
    void deleteByProductId(Long productId);
}
