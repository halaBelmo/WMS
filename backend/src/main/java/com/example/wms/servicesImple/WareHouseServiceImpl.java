package com.example.wms.servicesImple;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.CreateWareHouseRequestDTO;
import com.example.wms.dtos.UpdateWareHouseRequestDTO;
import com.example.wms.dtos.WareHouseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.RoleName;
import com.example.wms.entities.User;
import com.example.wms.entities.WareHouse;
import com.example.wms.mappers.WareHouseMapper;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.WarehouseRepository;
import com.example.wms.services.WareHouseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WareHouseServiceImpl implements WareHouseService {

    private final WarehouseRepository wareHouseRepository;
    private final UserRepository userRepository;
    private final WareHouseMapper wareHouseMapper;

    @Override
    public WareHouseDTO createWareHouse(CreateWareHouseRequestDTO request, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can create warehouses");
        }

        Company company = owner.getCompany();

        WareHouse warehouse = new WareHouse();
        warehouse.setName(request.getName());
        warehouse.setCompany(company);

        WareHouse savedWarehouse = wareHouseRepository.save(warehouse);

        company.getWarehouses().add(savedWarehouse);

        return wareHouseMapper.toDTO(savedWarehouse);
    }

    @Override
    public WareHouseDTO updateWareHouse(Long warehouseId, UpdateWareHouseRequestDTO request, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can update warehouses");
        }

        WareHouse warehouse = wareHouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if (warehouse.getCompany() == null || owner.getCompany() == null ||
                !warehouse.getCompany().getId().equals(owner.getCompany().getId())) {
            throw new RuntimeException("Access denied: warehouse does not belong to your company");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            warehouse.setName(request.getName());
        }

  

        WareHouse updatedWarehouse = wareHouseRepository.save(warehouse);

        return wareHouseMapper.toDTO(updatedWarehouse);
    }

    @Override
    public void deleteWareHouse(Long warehouseId, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can delete warehouses");
        }

        WareHouse warehouse = wareHouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if (warehouse.getCompany() == null || owner.getCompany() == null ||
                !warehouse.getCompany().getId().equals(owner.getCompany().getId())) {
            throw new RuntimeException("Access denied: warehouse does not belong to your company");
        }

        wareHouseRepository.delete(warehouse);
    }

    @Override
    public List<WareHouseDTO> getCompanyWareHouses(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can view warehouses");
        }

        return wareHouseRepository.findByCompany(owner.getCompany())
                .stream()
                .map(wareHouseMapper::toDTO)
                .toList();
    }
}