package com.example.wms.events;


import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonFormat;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class StockMovementEvent {

    private Long id;
    private Long productId;
    private Long warehouseId; // <-- NOUVELLE COLONNE : L'entrepôt global

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

    // ... tes autres attributs ...

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime validatedAt;

}