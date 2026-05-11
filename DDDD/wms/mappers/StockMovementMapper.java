package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.StockMovementRequestDTO;
import com.example.wms.dtos.StockMovementResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.entities.Product;
import com.example.wms.entities.StockMovement;
import com.example.wms.entities.User;
import com.example.wms.entities.ValidationStatus;
import com.example.wms.events.StockMovementEvent;
@Component
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
            dto.setFromLocationCode(movement.getFromLocation().getCode());
            dto.setFromLocationName(
                    movement.getFromLocation().getName() != null
                            ? movement.getFromLocation().getName()
                            : movement.getFromLocation().getCode()
            );
        }

        if (movement.getToLocation() != null) {
            dto.setToLocationId(movement.getToLocation().getId());
            dto.setToLocationCode(movement.getToLocation().getCode());
            dto.setToLocationName(
                    movement.getToLocation().getName() != null
                            ? movement.getToLocation().getName()
                            : movement.getToLocation().getCode()
            );
        }

        if (movement.getCreatedBy() != null) {
            dto.setCreatedBy(movement.getCreatedBy().getName());
        }

        if (movement.getValidatedBy() != null) {
            dto.setValidatedBy(movement.getValidatedBy().getName());
        }

        return dto;
    }

    public static StockMovementEvent toEvent(StockMovement sm) {

        StockMovementEvent event = new StockMovementEvent();

        event.setId(sm.getId());
        event.setProductId(sm.getProduct() != null ? sm.getProduct().getId() : null);
        event.setProductName(sm.getProduct() != null ? sm.getProduct().getName() : null); // ✅ FIX: productName was never set → null in HDFS/Hive

        // ==========================================
        // 🎯 NOUVEAU : RÉCUPÉRATION DU WAREHOUSE ID
        // ==========================================
        Long warehouseId = null;

        // 1. On regarde d'abord l'emplacement d'arrivée (ex: Entrées IN)
        if (sm.getToLocation() != null && sm.getToLocation().getWarehouse() != null) {
            warehouseId = sm.getToLocation().getWarehouse().getId();
        }
        // 2. Sinon on regarde l'emplacement de départ (ex: Sorties OUT)
        else if (sm.getFromLocation() != null && sm.getFromLocation().getWarehouse() != null) {
            warehouseId = sm.getFromLocation().getWarehouse().getId();
        }

        // On affecte l'ID de l'entrepôt à l'événement Kafka
        event.setWarehouseId(warehouseId);
        // ==========================================

        event.setFromLocationId(
                sm.getFromLocation() != null ? sm.getFromLocation().getId() : null
        );

        event.setToLocationId(
                sm.getToLocation() != null ? sm.getToLocation().getId() : null
        );

        event.setQuantity(sm.getQuantity());

        event.setMovementType(
                sm.getMovementType() != null ? sm.getMovementType().name() : null
        );

        event.setMovementReason(
                sm.getMovementReason() != null ? sm.getMovementReason().name() : null
        );

        event.setDestinationType(
                sm.getDestinationType() != null ? sm.getDestinationType().name() : null
        );

        event.setDestinationId(sm.getDestinationId());

        event.setStatus(
                sm.getStatus() != null ? sm.getStatus().name() : null
        );

        event.setCreatedById(
                sm.getCreatedBy() != null ? sm.getCreatedBy().getId() : null
        );

        event.setValidatedById(
                sm.getValidatedBy() != null ? sm.getValidatedBy().getId() : null
        );

        event.setCreatedAt(sm.getCreatedAt());
        event.setValidatedAt(sm.getValidatedAt());

        return event;
    }

}
