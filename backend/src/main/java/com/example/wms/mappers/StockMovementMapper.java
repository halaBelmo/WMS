package com.example.wms.mappers;

import com.example.wms.dtos.StockMovementRequestDTO;
import com.example.wms.dtos.StockMovementResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.entities.Product;
import com.example.wms.entities.StockMovement;
import com.example.wms.entities.User;
import com.example.wms.entities.ValidationStatus;

public class StockMovementMapper {

    public static StockMovement toEntity(
            StockMovementRequestDTO dto,
            Product product,
            Location fromLocation,
            Location toLocation,
            User createdBy
    ) {
        StockMovement movement = new StockMovement();

        movement.setProduct(product);
        movement.setFromLocation(fromLocation);
        movement.setToLocation(toLocation);
        movement.setQuantity(dto.getQuantity());

        movement.setMovementType(dto.getMovementType());
        movement.setMovementReason(dto.getMovementReason());

        movement.setDestinationType(dto.getDestinationType());
        movement.setDestinationId(dto.getDestinationId());

        movement.setStatus(ValidationStatus.PENDING);
        movement.setCreatedBy(createdBy);
        movement.setNotes(dto.getNotes());

        return movement;
    }

    public static StockMovementResponseDTO toDTO(StockMovement movement) {
        StockMovementResponseDTO dto = new StockMovementResponseDTO();

        dto.setId(movement.getId());
        dto.setQuantity(movement.getQuantity());

        dto.setMovementType(movement.getMovementType());
        dto.setMovementReason(movement.getMovementReason());

        dto.setDestinationType(movement.getDestinationType());
        dto.setDestinationId(movement.getDestinationId());

        dto.setStatus(movement.getStatus());

        dto.setCreatedAt(movement.getCreatedAt());
        dto.setValidatedAt(movement.getValidatedAt());
        dto.setNotes(movement.getNotes());

        if (movement.getProduct() != null) {
            dto.setProductId(movement.getProduct().getId());
            dto.setProductName(movement.getProduct().getName());
        }

        if (movement.getFromLocation() != null) {
            dto.setFromLocationId(movement.getFromLocation().getId());
            dto.setFromLocationName(movement.getFromLocation().getName());
        }

        if (movement.getToLocation() != null) {
            dto.setToLocationId(movement.getToLocation().getId());
            dto.setToLocationName(movement.getToLocation().getName());
        }

        if (movement.getCreatedBy() != null) {
            dto.setCreatedBy(movement.getCreatedBy().getName());
        }

        if (movement.getValidatedBy() != null) {
            dto.setValidatedBy(movement.getValidatedBy().getName());
        }

        return dto;
    }
}