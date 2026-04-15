package com.example.wms.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationResponseDTO {

    private Long id;

    private String name;

    private String zone;

    private String rack;

    private String etager;

    private Long warehouseId;

    private String warehouseName;
}