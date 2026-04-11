package com.example.wms.repositories;

import com.example.wms.entities.WareHouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<WareHouse, Long> {
}