package com.example.wms.mappers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.ZoneResponseDTO;
import com.example.wms.entities.Zone;

@Component
public class ZoneMapper {

    public ZoneResponseDTO toDTO(Zone zone) {
        ZoneResponseDTO dto = new ZoneResponseDTO();
        dto.setId(zone.getId());
        dto.setName(zone.getName());
        if (zone.getWarehouse() != null) {
            dto.setWarehouseId(zone.getWarehouse().getId());
            dto.setWarehouseName(zone.getWarehouse().getName());
        }
        return dto;
    }
    
    public List<ZoneResponseDTO> toDTOList(List<Zone> zones) {
        return zones.stream().map(this::toDTO).collect(Collectors.toList());
    }
}

