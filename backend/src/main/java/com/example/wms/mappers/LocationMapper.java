package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.LocationResponseDTO;
import com.example.wms.entities.Location;

@Component
public class LocationMapper {

    public LocationResponseDTO toDTO(Location location) {
        if (location == null) {
            return null;
        }

        LocationResponseDTO dto = new LocationResponseDTO();
        dto.setId(location.getId());
        dto.setName(location.getName());
        dto.setZone(location.getZone());
        dto.setRack(location.getRack());
        dto.setEtager(location.getEtager());

        if (location.getWarehouse() != null) {
            dto.setWarehouseId(location.getWarehouse().getId());
            dto.setWarehouseName(location.getWarehouse().getName());
        }

        return dto;
    }
}
