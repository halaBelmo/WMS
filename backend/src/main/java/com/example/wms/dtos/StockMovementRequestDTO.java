package com.example.wms.dtos;

import com.example.wms.entities.DestinationType;
import com.example.wms.entities.MovementReason;
import com.example.wms.entities.MovementType;

import lombok.Data;

@Data
public class StockMovementRequestDTO {

    private Long productId;

    private Long fromLocationId;
    private Long toLocationId;

    private Long quantity;

    private MovementType movementType;
    private MovementReason movementReason;

    private DestinationType destinationType;
    private Long destinationId;

    private String notes;
}