package com.example.wms.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wms.entities.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 🔎 récupérer tous les produits d'une company
    List<Product> findByCompanyId(Long companyId);

    // 🔎 récupérer les produits d'une location

    // 🔎 chercher par SKU (optionnel mais très utile)
}