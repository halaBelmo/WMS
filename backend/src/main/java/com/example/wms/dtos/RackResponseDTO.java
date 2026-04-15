package com.example.wms.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RackResponseDTO {
    private Long id;
    private String code;
    private Long zoneId;
    private String zoneName;
}
