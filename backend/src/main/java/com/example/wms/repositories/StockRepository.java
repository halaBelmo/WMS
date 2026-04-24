package com.example.wms.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByLocationId(Long locationId);

    List<Stock> findByProductId(Long productId);
}