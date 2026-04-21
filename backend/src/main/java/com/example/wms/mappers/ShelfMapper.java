package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.ShelfRequestDTO;
import com.example.wms.dtos.ShelfResponseDTO;
import com.example.wms.entities.Shelf;
import com.example.wms.repositories.RackRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ShelfMapper {

    private final RackRepository rackRepository;

    public Shelf toEntity(ShelfRequestDTO dto) {
        Shelf shelf = new Shelf();
        shelf.setLevel(dto.getCode());
        if (dto.getRackId() != null) {
            rackRepository.findById(dto.getRackId())
                .ifPresentOrElse(
                    shelf::setRack,
                    () -> { throw new IllegalArgumentException("Rack not found: " + dto.getRackId()); }
                );
        }
        return shelf;
    }

    public ShelfResponseDTO toResponseDTO(Shelf shelf) {
        ShelfResponseDTO dto = new ShelfResponseDTO();
        dto.setId(shelf.getId());
        dto.setCode(shelf.getLevel());
        if (shelf.getRack() != null) {
            dto.setRackId(shelf.getRack().getId());
            dto.setRackCode(shelf.getRack().getCode());
        }
        return dto;
    }
}
