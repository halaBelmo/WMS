package com.example.wms.dtos;

import lombok.Data;

@Data
public class ProductResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;

    private Long supplierId;
    private String supplierName;
}