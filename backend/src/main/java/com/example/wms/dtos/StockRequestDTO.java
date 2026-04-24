package com.example.wms.dtos;

import lombok.Data;

@Data
public class StockRequestDTO {

    private Long productId;
    private Long locationId;
    private Long quantity;
}