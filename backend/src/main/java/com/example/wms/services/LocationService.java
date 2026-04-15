package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.LocationRequestDTO;
import com.example.wms.dtos.LocationResponseDTO;
import com.example.wms.entities.Location;
import com.example.wms.entities.RoleName;
import com.example.wms.entities.User;
import com.example.wms.entities.WareHouse;
import com.example.wms.mappers.LocationMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.WarehouseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationService {

    private final LocationRepository locationRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final LocationMapper locationMapper;

    public LocationResponseDTO create(LocationRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        WareHouse warehouse = getManagedWarehouse(request.getWarehouseId(), currentUser);

        Location location = new Location();
        location.setName(request.getName());
        location.setZone(request.getZone());
        location.setRack(request.getRack());
        location.setEtager(request.getEtager());
        location.setWarehouse(warehouse);

        return locationMapper.toDTO(locationRepository.save(location));
    }

    public LocationResponseDTO update(Long id, LocationRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        WareHouse managedWarehouse = getManagedWarehouse(request.getWarehouseId(), currentUser);
        Location location = locationRepository.findByIdAndWarehouse(id, managedWarehouse)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            location.setName(request.getName());
        }
        if (request.getZone() != null && !request.getZone().isBlank()) {
            location.setZone(request.getZone());
        }
        if (request.getRack() != null && !request.getRack().isBlank()) {
            location.setRack(request.getRack());
        }
        if (request.getEtager() != null && !request.getEtager().isBlank()) {
            location.setEtager(request.getEtager());
        }

        return locationMapper.toDTO(locationRepository.save(location));
    }

    public void delete(Long id, Long wareHouseId, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        WareHouse managedWarehouse = getManagedWarehouse(wareHouseId, currentUser);
        Location location = locationRepository.findByIdAndWarehouse(id, managedWarehouse)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        locationRepository.delete(location);
    }

    public List<LocationResponseDTO> getByWarehouse(Long wareHouseId, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        WareHouse managedWarehouse = getManagedWarehouse(wareHouseId, currentUser);

        return locationRepository.findByWarehouse(managedWarehouse)
                .stream()
                .map(locationMapper::toDTO)
                .toList();
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private void ensureOwnerOrAdmin(User user) {
        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.OWNER && roleName != RoleName.ADMIN) {
            throw new RuntimeException("Access denied");
        }
    }

    private WareHouse getManagedWarehouse(Long wareHouseId, User currentUser) {
        if (wareHouseId == null) {
            throw new RuntimeException("Warehouse is required");
        }

        WareHouse warehouse = warehouseRepository.findById(wareHouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if (warehouse.getCompany() == null || currentUser.getCompany() == null
                || !warehouse.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new RuntimeException("Warehouse does not belong to your company");
        }

        if (currentUser.getRole().getName() == RoleName.ADMIN) {
            if (currentUser.getWarehouse() == null) {
                throw new RuntimeException("ADMIN is not assigned to any warehouse");
            }

            if (!warehouse.getId().equals(currentUser.getWarehouse().getId())) {
                throw new RuntimeException("ADMIN can only manage locations in his own warehouse");
            }
        }

        return warehouse;
    }
    
    public LocationResponseDTO getById(Long id, Long warehouseId, String username) {
    Location location = locationRepository.findByIdAndWarehouseId(id, warehouseId)
            .orElseThrow(() -> new RuntimeException("Location not found"));

    return locationMapper.toDTO(location);
}}
