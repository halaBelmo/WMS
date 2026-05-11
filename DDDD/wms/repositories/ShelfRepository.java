package com.example.wms.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Shelf;

public interface ShelfRepository extends JpaRepository<Shelf, Long> {
    void deleteByRackId(Long rackId);
    List<Shelf> findByRack_Id(Long rackId);
}