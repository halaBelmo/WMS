package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.SupplierRequestDTO;
import com.example.wms.dtos.SupplierResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.RoleName;
import com.example.wms.entities.Supplier;
import com.example.wms.entities.User;
import com.example.wms.mappers.SupplierMapper;
import com.example.wms.repositories.SupplierRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final UserRepository userRepository;

    public SupplierResponseDTO create(SupplierRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        if (supplierRepository.existsByEmailAndCompany(request.getEmail(), currentUser.getCompany())) {
            throw new RuntimeException("Supplier email already exists in your company");
        }

        Supplier supplier = supplierMapper.toEntity(request);
        supplier.setCompany(currentUser.getCompany());

        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    public SupplierResponseDTO getById(Long id, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        Supplier supplier = getSupplierFromCompany(id, currentUser.getCompany());
        return supplierMapper.toResponse(supplier);
    }

    public List<SupplierResponseDTO> getAll(String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        return supplierMapper.toResponseList(
                supplierRepository.findByCompany(currentUser.getCompany())
        );
    }

    public SupplierResponseDTO update(Long id, SupplierRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        Supplier supplier = getSupplierFromCompany(id, currentUser.getCompany());

        if (!supplier.getEmail().equals(request.getEmail())
                && supplierRepository.existsByEmailAndCompany(request.getEmail(), currentUser.getCompany())) {
            throw new RuntimeException("Supplier email already exists in your company");
        }

        supplierMapper.updateEntity(request, supplier);
        supplier.setCompany(currentUser.getCompany());

        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    public void delete(Long id, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        Supplier supplier = getSupplierFromCompany(id, currentUser.getCompany());
        supplierRepository.delete(supplier);
    }

    public List<SupplierResponseDTO> searchByName(String name, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        return supplierMapper.toResponseList(
                supplierRepository.findByCompanyAndNameContainingIgnoreCase(currentUser.getCompany(), name)
        );
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private Supplier getSupplierFromCompany(Long supplierId, Company company) {
        return supplierRepository.findByIdAndCompany(supplierId, company)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    private void ensureOwnerOrAdmin(User user) {
        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.OWNER && roleName != RoleName.ADMIN) {
            throw new RuntimeException("Access denied");
        }
    }
}
