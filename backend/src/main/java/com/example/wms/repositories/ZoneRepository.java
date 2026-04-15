package com.example.wms.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wms.entities.Zone;


@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByWarehouse_Id(Long warehouseId);
}