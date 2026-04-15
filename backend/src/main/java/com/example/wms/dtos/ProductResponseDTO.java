package com.example.wms.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponseDTO {
    private Long id;
    private String reference;
    private String nom;
    private String description;
    private String categorie;
    private int quantiteDisponible;
    private Long supplierId;
    private String supplierName;
    private Long locationId;
    private String locationName;
    private Long warehouseId;
    private String warehouseName;
}
