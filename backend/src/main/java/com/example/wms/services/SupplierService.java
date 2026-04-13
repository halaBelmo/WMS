package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.SupplierRequestDTO;
import com.example.wms.dtos.SupplierResponseDTO;
import com.example.wms.entities.Supplier;
import com.example.wms.mappers.SupplierMapper;
import com.example.wms.repositories.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    // Create
    public SupplierResponseDTO create(SupplierRequestDTO request) {
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Supplier supplier = supplierMapper.toEntity(request);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    // Get by ID
    public SupplierResponseDTO getById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return supplierMapper.toResponse(supplier);
    }

    // Get All
    public List<SupplierResponseDTO> getAll() {
        return supplierMapper.toResponseList(supplierRepository.findAll());
    }

    // Update
    public SupplierResponseDTO update(Long id, SupplierRequestDTO request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplierMapper.updateEntity(request, supplier);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    // Delete
    public void delete(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found");
        }
        supplierRepository.deleteById(id);
    }

    // Search by name
    public List<SupplierResponseDTO> searchByName(String name) {
        return supplierMapper.toResponseList(
            supplierRepository.findByNameContainingIgnoreCase(name)
        );
    }
}