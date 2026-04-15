package com.example.wms.repositories;

import com.example.wms.entities.Company;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wms.entities.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByIdAndCompany(Long id, Company company);
    Optional<Supplier> findByEmailAndCompany(String email, Company company);
    boolean existsByEmailAndCompany(String email, Company company);
    List<Supplier> findByCompany(Company company);
    List<Supplier> findByCompanyAndNameContainingIgnoreCase(Company company, String name);
}

