package com.example.wms.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Company;
import com.example.wms.entities.WareHouse;

public interface WarehouseRepository extends JpaRepository<WareHouse, Long> {
    List<WareHouse> findByCompany(Company company);
    

}