package com.example.wms.dtos;

import java.time.LocalDateTime;

import com.example.wms.entities.DestinationType;
import com.example.wms.entities.MovementReason;
import com.example.wms.entities.MovementType;
import com.example.wms.entities.ValidationStatus;

import lombok.Data;

@Data
public class StockMovementResponseDTO {

    private Long id;

    private Long productId;
    private String productName;

    private Long fromLocationId;
    private String fromLocationCode;
    private String fromLocationName;

    private Long toLocationId;
    private String toLocationCode;
    private String toLocationName;

    private Long quantity;

    private MovementType movementType;
    private MovementReason movementReason;

    private DestinationType destinationType;
    private Long destinationId;

    private ValidationStatus status;

    private String createdBy;
    private String validatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;

    private String notes;
}
