package com.example.wms.dtos;

import lombok.Data;

@Data
public class ProductRequestDTO {

    private String name;
    private String description;
    private Double price;

    private Long supplierId;
}
