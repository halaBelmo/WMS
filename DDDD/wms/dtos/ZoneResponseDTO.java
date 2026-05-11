package com.example.wms.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZoneResponseDTO {
    private Long id;
    private String name;
    private Long warehouseId;
    private String warehouseName;
}
