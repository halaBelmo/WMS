package com.example.wms.repositories;

import com.example.wms.entities.Company;
import com.example.wms.entities.WareHouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarehouseRepository extends JpaRepository<WareHouse, Long> {
    List<WareHouse> findByCompany(Company company);

}