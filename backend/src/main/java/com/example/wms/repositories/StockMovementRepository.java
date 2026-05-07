package com.example.wms.repositories;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.entities.StockMovement;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    @Transactional
    void deleteByProductId(Long productId);
}
