package com.example.wms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Location;
import com.example.wms.entities.WareHouse;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByWarehouse(WareHouse warehouse);
    Optional<Location> findByIdAndWarehouse(Long id, WareHouse warehouse);
    Optional<Location> findByIdAndWarehouseId(Long id, Long warehouseId);
}
