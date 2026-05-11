package com.example.wms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wms.entities.Company;
import com.example.wms.entities.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByCompany(Company company);

    Optional<Customer> findByIdAndCompany(Long id, Company company);

    boolean existsByEmailAndCompany(String email, Company company);
}