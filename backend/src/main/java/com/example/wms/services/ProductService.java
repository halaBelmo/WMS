package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.ProductRequestDTO;
import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Location;
import com.example.wms.entities.Product;
import com.example.wms.entities.RoleName;
import com.example.wms.entities.Supplier;
import com.example.wms.entities.User;
import com.example.wms.entities.WareHouse;
import com.example.wms.mappers.ProductMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.ProductRepository;
import com.example.wms.repositories.SupplierRepository;
import com.example.wms.repositories.UserRepository;
import com.example.wms.repositories.WarehouseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductMapper productMapper;

    public ProductResponseDTO create(ProductRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        Location location = getManagedLocation(request.getEmplacementId(), currentUser);
        Supplier supplier = getSupplierFromCompany(request.getFournisseurId(), currentUser.getCompany());

        Long warehouseId = location.getWarehouse().getId();
        if (productRepository.existsByReferenceAndLocation_WarehouseId(request.getReference(), warehouseId)) {
            throw new RuntimeException("Product reference already exists in this warehouse");
        }

        Product product = new Product();
        product.setReference(request.getReference());
        product.setNom(request.getNom());
        product.setDescription(request.getDescription());
        product.setCategorie(request.getCategorie());
        product.setQuantiteDisponible(request.getQuantiteDisponible());
        product.setLocation(location);
        product.setSupplier(supplier);

        return productMapper.toDTO(productRepository.save(product));
    }

    public ProductResponseDTO update(Long id, ProductRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        Location location = getManagedLocation(request.getEmplacementId(), currentUser);
        Product product = productRepository.findByIdAndLocation_WarehouseId(id, location.getWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Supplier supplier = getSupplierFromCompany(request.getFournisseurId(), currentUser.getCompany());

        if (!product.getReference().equals(request.getReference())
                && productRepository.existsByReferenceAndLocation_WarehouseId(request.getReference(), location.getWarehouse().getId())) {
            throw new RuntimeException("Product reference already exists in this warehouse");
        }

        product.setReference(request.getReference());
        product.setNom(request.getNom());
        product.setDescription(request.getDescription());
        product.setCategorie(request.getCategorie());
        product.setQuantiteDisponible(request.getQuantiteDisponible());
        product.setLocation(location);
        product.setSupplier(supplier);

        return productMapper.toDTO(productRepository.save(product));
    }

    public void delete(Long id, Long wareHouseId, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        WareHouse warehouse = getManagedWarehouse(wareHouseId, currentUser);
        Product product = productRepository.findByIdAndLocation_WarehouseId(id, warehouse.getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }

    public List<ProductResponseDTO> getByWarehouse(Long wareHouseId, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        WareHouse warehouse = getManagedWarehouse(wareHouseId, currentUser);

        return productRepository.findByLocation_WarehouseId(warehouse.getId())
                .stream()
                .map(productMapper::toDTO)
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
                throw new RuntimeException("ADMIN can only manage products in his own warehouse");
            }
        }

        return warehouse;
    }

    private Location getManagedLocation(Long locationId, User currentUser) {
        if (locationId == null) {
            throw new RuntimeException("Location is required");
        }

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        getManagedWarehouse(location.getWarehouse().getId(), currentUser);
        return location;
    }

    private Supplier getSupplierFromCompany(Long supplierId, Company company) {
        if (supplierId == null) {
            throw new RuntimeException("Supplier is required");
        }

        return supplierRepository.findByIdAndCompany(supplierId, company)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }
}
