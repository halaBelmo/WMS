package com.example.wms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Rack;


public interface RackRepository extends JpaRepository<Rack, Long> {
    void deleteByZoneId(Long zoneId);
    List<Rack> findByZone_Id(Long zoneId);
    Optional<Rack> findByIdAndZone_WarehouseId(Long id, Long warehouseId);
}
