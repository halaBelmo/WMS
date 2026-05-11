package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.ZoneRequestDTO;
import com.example.wms.entities.Rack;
import com.example.wms.entities.Shelf;
import com.example.wms.entities.User;
import com.example.wms.entities.Zone;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.RackRepository;
import com.example.wms.repositories.ShelfRepository;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.ZoneRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
private final UserRepository userRepository;
    private final RackRepository rackRepository;
    private final ShelfRepository shelfRepository;
    private final LocationRepository locationRepository;


    public Zone update(Long id, ZoneRequestDTO dto, String username) {
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Zone zone = zoneRepository.findByIdAndWarehouseId(id, currentUser.getWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Zone not found or access denied"));

        zone.setName(dto.getName());
        zone.setWarehouse(currentUser.getWarehouse());

        return zoneRepository.save(zone);
    }

@Transactional
public void delete(Long id, String username) {
    User currentUser = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Long warehouseId = currentUser.getWarehouse().getId();

    // Delete all racks in zone
    List<Rack> racks = rackRepository.findByZone_Id(id);
    for (Rack rack : racks) {
        List<Shelf> shelves = shelfRepository.findByRack_Id(rack.getId());
        for (Shelf shelf : shelves) {
            locationRepository.deleteByShelfId(shelf.getId());
        }
        shelfRepository.deleteByRackId(rack.getId());
    }
    rackRepository.deleteByZoneId(id);

    Zone zone = zoneRepository.findByIdAndWarehouseId(id, warehouseId)
            .orElseThrow(() -> new RuntimeException("Zone not found or access denied"));

    zoneRepository.delete(zone);
}


    public List<Zone> getZones(String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long warehouseId = user.getWarehouse().getId();

        return zoneRepository.findByWarehouseId(warehouseId);
    }

    public Zone create(Zone zone, String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        zone.setWarehouse(user.getWarehouse());

        return zoneRepository.save(zone);
    }
}