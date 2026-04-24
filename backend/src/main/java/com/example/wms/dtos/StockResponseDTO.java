package com.example.wms.dtos;

import lombok.Data;

@Data
public class StockResponseDTO {

    private Long id;

    private Long productId;
    private String productName;

    private Long locationId;
    private String locationName;

    private Long quantity;
}