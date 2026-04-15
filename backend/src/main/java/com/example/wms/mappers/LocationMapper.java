package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.LocationRequestDTO;
import com.example.wms.dtos.LocationResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.repositories.ShelfRepository;

@Component
public class LocationMapper {

    private final ShelfRepository shelfRepository;

    public LocationMapper(ShelfRepository shelfRepository) {
        this.shelfRepository = shelfRepository;
    }

    public LocationResponseDTO toDTO(Location location) {

        if (location == null) {
            return null;
        }

        LocationResponseDTO dto = new LocationResponseDTO();

        dto.setId(location.getId());
        dto.setName(location.getName() != null ? location.getName() : location.getCode());

        // Populate hierarchy flat fields
        if (location.getShelf() != null) {
            dto.setEtager(location.getShelf().getLevel());

            if (location.getShelf().getRack() != null) {
                dto.setRack(location.getShelf().getRack().getCode());

                if (location.getShelf().getRack().getZone() != null) {
                    dto.setZone(location.getShelf().getRack().getZone().getName());

                    if (location.getShelf().getRack().getZone().getWarehouse() != null) {
                        dto.setWarehouseId(location.getShelf().getRack().getZone().getWarehouse().getId());
                        dto.setWarehouseName(location.getShelf().getRack().getZone().getWarehouse().getName());
                    }
                }
            }
        }

        return dto;
    }

    public Location toEntity(LocationRequestDTO dto) {
        if (dto == null) return null;

        Location location = new Location();
        location.setName(dto.getName());
        location.setCode(dto.getName()); // Fallback
        // shelf set in service layer
        return location;
    }
}

