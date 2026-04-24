package com.example.wms.mappers;

import com.example.wms.dtos.ProductRequestDTO;
import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.entities.Product;
import com.example.wms.entities.Supplier;

public class ProductMapper {

    public static Product toEntity(ProductRequestDTO dto, Location location, Supplier supplier) {

        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());

        product.setSupplier(supplier);

        return product;
    }

    public static ProductResponseDTO toDTO(Product product) {

        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());

        

        if (product.getSupplier() != null) {
            dto.setSupplierId(product.getSupplier().getId());
            dto.setSupplierName(product.getSupplier().getName());
        }

        return dto;
    }
}