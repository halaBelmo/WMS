package com.example.wms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.ShelfMapper;
import com.example.wms.dtos.ShelfRequestDTO;
import com.example.wms.dtos.ShelfResponseDTO;
import com.example.wms.entities.Shelf;
import com.example.wms.repositories.ShelfRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShelfService {

    private final ShelfRepository shelfRepository;
    private final ShelfMapper shelfMapper;

    public List<ShelfResponseDTO> getByRack(Long rackId) {
        return shelfRepository.findByRack_Id(rackId).stream()
            .map(shelfMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    public ShelfResponseDTO create(ShelfRequestDTO dto) {
        Shelf shelf = shelfMapper.toEntity(dto);
        shelf = shelfRepository.save(shelf);
        return shelfMapper.toResponseDTO(shelf);
    }
}

