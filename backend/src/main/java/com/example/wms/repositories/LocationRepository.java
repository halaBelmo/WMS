package com.example.wms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Location;
import com.example.wms.entities.WareHouse;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByWarehouse(WareHouse warehouse);
    List<Location> findByWarehouseId(Long warehouseId);
    Optional<Location> findByIdAndWarehouseId(Long id, Long warehouseId);
    Optional<Location> findByIdAndWarehouse(Long id, WareHouse warehouse);
    List<Location> findByShelf_Id(Long shelfId);
    Optional<Location> findByIdAndShelf_Id(Long id, Long shelfId);
    void deleteByShelfId(Long shelfId);
    List<Location> findByShelfRackZoneWarehouse_Id(Long warehouseId);
}
