package com.example.wms.dtos;

import lombok.Data;

@Data
public class MovementSimulationRequestDTO {

    private Integer count = 10;
    private Long minQuantity = 1L;
    private Long maxQuantity = 20L;
    private Boolean autoValidate = false;
}
