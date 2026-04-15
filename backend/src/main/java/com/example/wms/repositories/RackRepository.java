package com.example.wms.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Rack;

public interface RackRepository extends JpaRepository<Rack, Long> {

    List<Rack> findByZone_Id(Long zoneId);
}