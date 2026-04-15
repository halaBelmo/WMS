package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.entities.Product;

@Component
public class ProductMapper {

    public ProductResponseDTO toDTO(Product product) {

        if (product == null) {
            return null;
        }

        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setId(product.getId());
        dto.setReference(product.getReference());
        dto.setNom(product.getNom());
        dto.setDescription(product.getDescription());
        dto.setCategorie(product.getCategorie());
        dto.setQuantiteDisponible(product.getQuantiteDisponible());

        // Supplier
        if (product.getSupplier() != null) {
            dto.setSupplierId(product.getSupplier().getId());
            dto.setSupplierName(product.getSupplier().getName());
        }

        // Location
        if (product.getLocation() != null) {

            dto.setLocationId(product.getLocation().getId());
            dto.setLocationName(product.getLocation().getName());

            // Warehouse traversal via shelf (future)
            // if (product.getLocation().getShelf().getRack().getZone().getWarehouse() != null) { ... }
            // dto.setWarehouseId(...);
        }

        return dto;
    }

    // OPTIONAL BUT STRONGLY RECOMMENDED
    public Product toEntity() {
        return new Product();
    }
}