package com.example.wms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.ShelfRequestDTO;
import com.example.wms.dtos.ShelfResponseDTO;
import com.example.wms.entities.Shelf;
import com.example.wms.mappers.ShelfMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.ShelfRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ShelfService {


    private final ShelfRepository shelfRepository;
    private final LocationRepository locationRepository;
    private final ShelfMapper shelfMapper;


    public List<ShelfResponseDTO> getByRack(Long rackId) {
        return shelfRepository.findByRack_Id(rackId).stream()
            .map(shelfMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ShelfResponseDTO update(Long id, ShelfRequestDTO dto) {
        Shelf shelf = shelfRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelf not found"));
                shelf.setLevel(dto.getCode());

        return shelfMapper.toResponseDTO(shelfRepository.save(shelf));
    }

    @Transactional
    public void delete(Long id) {
        // Delete locations first
        locationRepository.deleteByShelfId(id);
        shelfRepository.deleteById(id);
    }

    public ShelfResponseDTO create(ShelfRequestDTO dto) {
        Shelf shelf = shelfMapper.toEntity(dto);
        shelf = shelfRepository.save(shelf);
        return shelfMapper.toResponseDTO(shelf);
    }
}


