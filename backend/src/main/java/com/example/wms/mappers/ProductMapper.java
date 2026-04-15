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

        if (product.getSupplier() != null) {
            dto.setSupplierId(product.getSupplier().getId());
            dto.setSupplierName(product.getSupplier().getName());
        }

        if (product.getLocation() != null) {
            dto.setLocationId(product.getLocation().getId());
            dto.setLocationName(product.getLocation().getName());

            if (product.getLocation().getWarehouse() != null) {
                dto.setWarehouseId(product.getLocation().getWarehouse().getId());
                dto.setWarehouseName(product.getLocation().getWarehouse().getName());
            }
        }

        return dto;
    }
}
