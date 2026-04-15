package com.example.wms.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.RackMapper;
import com.example.wms.dtos.RackRequestDTO;
import com.example.wms.dtos.RackResponseDTO;
import com.example.wms.entities.Rack;
import com.example.wms.repositories.RackRepository;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.ZoneRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RackService {

    private final RackRepository rackRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final RackMapper rackMapper;

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

