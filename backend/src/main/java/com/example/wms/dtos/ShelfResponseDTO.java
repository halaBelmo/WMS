package com.example.wms.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShelfResponseDTO {
    private Long id;
    private String code;
    private Long rackId;
    private String rackCode;
}
