package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.RackRequestDTO;
import com.example.wms.dtos.RackResponseDTO;
import com.example.wms.entities.Rack;
import com.example.wms.repositories.ZoneRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RackMapper {

    private final ZoneRepository zoneRepository;

    public Rack toEntity(RackRequestDTO dto) {
        Rack rack = new Rack();
        rack.setCode(dto.getCode());
        if (dto.getZoneId() != null) {
            zoneRepository.findById(dto.getZoneId())
                .ifPresentOrElse(
                    rack::setZone,
                    () -> { throw new IllegalArgumentException("Zone not found: " + dto.getZoneId()); }
                );
        }
        return rack;
    }

    public RackResponseDTO toResponseDTO(Rack rack) {
        RackResponseDTO dto = new RackResponseDTO();
        dto.setId(rack.getId());
        dto.setCode(rack.getCode());
        if (rack.getZone() != null) {
            dto.setZoneId(rack.getZone().getId());
            dto.setZoneName(rack.getZone().getName());
        }
        return dto;
    }
}
