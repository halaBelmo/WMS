package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.LocationRequestDTO;
import com.example.wms.dtos.LocationResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.entities.Rack;
import com.example.wms.entities.Shelf;
import com.example.wms.entities.User;
import com.example.wms.entities.Zone;
import com.example.wms.mappers.LocationMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.ShelfRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final ShelfRepository shelfRepository;
    private final UserRepository userRepository;
    private final LocationMapper locationMapper;

    // CREATE
    public LocationResponseDTO create(LocationRequestDTO request, String username) {
        User user = getUser(username);

        if (request.getShelfId() == null) {
            throw new RuntimeException("shelfId is required");
        }

        Shelf shelf = shelfRepository.findById(request.getShelfId())
                .orElseThrow(() -> new RuntimeException("Shelf not found"));

        // Check shelf belongs to user's warehouse
        if (!getWarehouseIdFromShelf(shelf).equals(user.getWarehouse().getId())) {
            throw new RuntimeException("Shelf does not belong to your warehouse");
        }
       Rack rack = shelf.getRack();
       Zone zone = rack.getZone();

// user input (ex: L07)
       String userInput = request.getName();

// build full code
       String fullCode = zone.getName()
        + "-" + rack.getCode()
        + "-" + shelf.getLevel()
        + "-" + userInput;

        Location location = locationMapper.toEntity(request);
        location.setShelf(shelf);
        location.setWarehouse(user.getWarehouse());
        location.setCode(fullCode);

        return locationMapper.toDTO(locationRepository.save(location));
    }

    // GET BY ID
    public LocationResponseDTO getById(Long id, String username) {
        User user = getUser(username);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        checkWarehouse(location, user);

        return locationMapper.toDTO(location);
    }

    // UPDATE
    public LocationResponseDTO update(Long id, LocationRequestDTO request, String username) {
        User user = getUser(username);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        checkWarehouse(location, user);

        location.setName(request.getName());
        // location.setCode(request.getName()); 

        // Update shelf if new shelfId
        if (request.getShelfId() != null) {
            Shelf shelf = shelfRepository.findById(request.getShelfId())
                .orElseThrow(() -> new RuntimeException("Shelf not found"));
            if (!getWarehouseIdFromShelf(shelf).equals(user.getWarehouse().getId())) {
                throw new RuntimeException("Shelf does not belong to your warehouse");
            }
            location.setShelf(shelf);
        }

        String fullCode = location.getShelf().getRack().getZone().getName()
        + "-" + location.getShelf().getRack().getCode()
        + "-" + location.getShelf().getLevel()
        + "-" + location.getName();

        location.setCode(fullCode);
        return locationMapper.toDTO(locationRepository.save(location));
    }
    // DELETE
    public void delete(Long id, String username) {
        User user = getUser(username);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        checkWarehouse(location, user);

        locationRepository.delete(location);
    }

    // GET BY WAREHOUSE
    public List<LocationResponseDTO> getByWarehouse(String username) {
        User user = getUser(username);

        return locationRepository.findByShelfRackZoneWarehouse_Id(user.getWarehouse().getId())
                .stream()
                .map(locationMapper::toDTO)
                .toList();
    }

    public List<LocationResponseDTO> getByShelf(Long shelfId, String username) {
        User user = getUser(username);
        Shelf shelf = shelfRepository.findById(shelfId)
                .orElseThrow(() -> new RuntimeException("Shelf not found"));
        if (!getWarehouseIdFromShelf(shelf).equals(user.getWarehouse().getId())) {
            throw new RuntimeException("Shelf not in your warehouse");
        }
        return locationRepository.findByShelf_Id(shelfId)
                .stream()
                .map(locationMapper::toDTO)
                .toList();
    }

    // 🔒 HELPERS
    private User getUser(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void checkWarehouse(Location location, User user) {
        Long locationWarehouseId = getWarehouseIdFromLocation(location);
        if (!locationWarehouseId.equals(user.getWarehouse().getId())) {
            throw new RuntimeException("Unauthorized access");
        }
    }

    private Long getWarehouseIdFromLocation(Location location) {
        Shelf shelf = location.getShelf();
        if (shelf == null) throw new RuntimeException("Location has no shelf");
        return getWarehouseIdFromShelf(shelf);
    }

    private Long getWarehouseIdFromShelf(Shelf shelf) {
        // TODO: Add Rack, Zone traversal - assuming hierarchy Shelf -> Rack -> Zone -> WareHouse
        // For now, assume Shelf has warehouse or traverse
        // Placeholder - implement full chain when Shelf/Rack/Zone fixed
        if (shelf.getRack() == null || shelf.getRack().getZone() == null || shelf.getRack().getZone().getWarehouse() == null) {
            throw new RuntimeException("Invalid hierarchy");
        }
        return shelf.getRack().getZone().getWarehouse().getId();
    }
}

