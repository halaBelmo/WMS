package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.entities.User;
import com.example.wms.entities.Zone;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.ZoneRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;

    public List<Zone> getZones(String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long warehouseId = user.getWarehouse().getId();

        return zoneRepository.findByWarehouse_Id(warehouseId);
    }

    public Zone create(Zone zone, String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        zone.setWarehouse(user.getWarehouse());

        return zoneRepository.save(zone);
    }
}