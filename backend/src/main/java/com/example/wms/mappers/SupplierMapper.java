package com.example.wms.mappers;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.SupplierRequestDTO;
import com.example.wms.dtos.SupplierResponseDTO;
import com.example.wms.entities.Supplier;
@Component

public class SupplierMapper {

    // Request → Entity
    public Supplier toEntity(SupplierRequestDTO request) {
        return Supplier.builder()
                .name(request.getName())
                .address(request.getAddress())
                .contact(request.getContact())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();
    }

    public SupplierResponseDTO toResponse(Supplier supplier) {
        return SupplierResponseDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .address(supplier.getAddress())
                .contact(supplier.getContact())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .build();
    }

    // Update existing Entity from Request
    public void updateEntity(SupplierRequestDTO request, Supplier supplier) {
        supplier.setName(request.getName());
        supplier.setAddress(request.getAddress());
        supplier.setContact(request.getContact());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
    }

    // List of Entities → List of Responses
    public List<SupplierResponseDTO> toResponseList(List<Supplier> suppliers) {
        return suppliers.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}