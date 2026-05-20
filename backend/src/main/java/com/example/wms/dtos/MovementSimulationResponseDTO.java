package com.example.wms.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MovementSimulationResponseDTO {

    private int requested;
    private int created;
    private int validated;
    private List<StockMovementResponseDTO> movements;
}
