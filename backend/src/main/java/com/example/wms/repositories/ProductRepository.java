package com.example.wms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Location;
import com.example.wms.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByLocation_WarehouseId(Long warehouseId);
    List<Product> findByLocation(Location location);
    Optional<Product> findByIdAndLocation_Warehouse_Id(Long id, Long warehouseId);
    boolean existsByReferenceAndLocation_WarehouseId(String reference, Long warehouseId);
    List<Product> findByLocation_Warehouse_Id(Long warehouseId);
    // GET products by warehouse (via location chain)
    List<Product> findByLocation_Shelf_Rack_Zone_Warehouse_Id(Long warehouseId);

    // GET product by id + warehouse safety check
    Optional<Product> findByIdAndLocation_Shelf_Rack_Zone_Warehouse_Id(
            Long id,
            Long warehouseId
    );

    boolean existsByReferenceAndLocation_ShelfRackZoneWarehouse_Id(String reference, Long warehouseId);
}
