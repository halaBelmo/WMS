package com.example.wms.events;


import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class StockMovementEvent {

    private Long id;
    private Long productId;

    private Long fromLocationId;
    private Long toLocationId;

    private Long quantity;

    private String movementType;
    private String movementReason;

    private String destinationType;
    private Long destinationId;

    private String status;

    private Long createdById;
    private Long validatedById;

    private LocalDateTime createdAt;
    private LocalDateTime validatedAt;

}