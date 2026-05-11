package com.example.wms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.RackRequestDTO;
import com.example.wms.dtos.RackResponseDTO;
import com.example.wms.entities.Rack;
import com.example.wms.entities.Shelf;
import com.example.wms.entities.User;
import com.example.wms.mappers.RackMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.RackRepository;
import com.example.wms.repositories.ShelfRepository;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.ZoneRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class RackService {

    private final RackRepository rackRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final RackMapper rackMapper;
    private final ShelfRepository shelfRepository;
    private final LocationRepository locationRepository;


    public RackResponseDTO update(Long id, RackRequestDTO dto, String username) {
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Rack rack = rackRepository.findByIdAndZone_WarehouseId(id, currentUser.getWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Rack not found or access denied"));

        rack.setCode(dto.getCode());
        rack.setZone(zoneRepository.findById(dto.getZoneId())
                .orElseThrow(() -> new RuntimeException("Zone not found")));

        return rackMapper.toResponseDTO(rackRepository.save(rack));
    }

    @Transactional
    public void delete(Long id, String username) {
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long warehouseId = currentUser.getWarehouse().getId();

        // Delete shelves first
        List<Shelf> shelves = shelfRepository.findByRack_Id(id);
        for (Shelf shelf : shelves) {
            locationRepository.deleteByShelfId(shelf.getId());
        }
        shelfRepository.deleteByRackId(id);

        Rack rack = rackRepository.findByIdAndZone_WarehouseId(id, warehouseId)
                .orElseThrow(() -> new RuntimeException("Rack not found or access denied"));

        rackRepository.delete(rack);
    }


    public List<RackResponseDTO> getByZone(Long zoneId, String username) {

        userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return rackRepository.findByZone_Id(zoneId).stream()
            .map(rackMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    public RackResponseDTO create(RackRequestDTO dto) {
        Rack rack = rackMapper.toEntity(dto);
        rack = rackRepository.save(rack);
        return rackMapper.toResponseDTO(rack);
    }
}

