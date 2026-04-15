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
import com.example.wms.entities.Shelf;
import com.example.wms.entities.Supplier;
import com.example.wms.entities.User;
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

    public ProductResponseDTO create(ProductRequestDTO request, String username) {

    User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Product product = new Product();
    product.setReference(request.getReference());
    product.setNom(request.getNom());
    product.setDescription(request.getDescription());
    product.setCategorie(request.getCategorie());
    product.setQuantiteDisponible(request.getQuantiteDisponible());

    Long locationId = request.getLocationId() != null ? request.getLocationId() : request.getEmplacementId();
    if (locationId == null) {
        throw new IllegalArgumentException("locationId or emplacementId is required");
    }
    product.setLocation(locationRepository.findById(locationId)
            .orElseThrow(() -> new RuntimeException("Location not found")));

    Long supplierId = request.getFournisseurId();
    if (supplierId == null) {
        throw new IllegalArgumentException("fournisseurId is required");
    }
    product.setSupplier(supplierRepository.findById(supplierId)
            .orElseThrow(() -> new RuntimeException("Supplier not found")));

    Product saved = productRepository.save(product);

    return productMapper.toDTO(saved);
}

    public ProductResponseDTO update(Long id, ProductRequestDTO request, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        ensureOwnerOrAdmin(currentUser);

        Location location = getManagedLocation(request.getEmplacementId(), currentUser);
        Product product = productRepository.findByIdAndLocation_Shelf_Rack_Zone_Warehouse_Id(id, getWarehouseIdFromLocation(location))
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Supplier supplier = getSupplierFromCompany(request.getFournisseurId(), currentUser.getCompany());

        Long whId = getWarehouseIdFromLocation(location);
        if (!product.getReference().equals(request.getReference())
                && productRepository.existsByReferenceAndLocation_WarehouseId(request.getReference(), whId)) {
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

   public void delete(Long id, String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long warehouseId = user.getWarehouse().getId();

        Product product = productRepository
                .findByIdAndLocation_Shelf_Rack_Zone_Warehouse_Id(id, warehouseId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }


 public List<ProductResponseDTO> getByWarehouse(String username) {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long warehouseId = user.getWarehouse().getId();

        return productRepository.findByLocation_Shelf_Rack_Zone_Warehouse_Id(warehouseId)
                .stream()
                .map(productMapper::toDTO)
                .toList();
    }

    public ProductResponseDTO getById(Long id, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long warehouseId = user.getWarehouse().getId();

        Product product = productRepository
                .findByIdAndLocation_Shelf_Rack_Zone_Warehouse_Id(id, warehouseId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return productMapper.toDTO(product);
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

   

    private Location getManagedLocation(Long locationId, User currentUser) {
        if (locationId == null) {
            throw new RuntimeException("Location is required");
        }

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        if (!getWarehouseIdFromLocation(location).equals(currentUser.getWarehouse().getId())) {
            throw new RuntimeException("Location not in your warehouse");
        }
        return location;
    }

    private Long getWarehouseIdFromLocation(Location location) {
        Shelf shelf = location.getShelf();
        if (shelf == null) throw new RuntimeException("Location has no shelf");
        // Traverse hierarchy
        if (shelf.getRack() == null || shelf.getRack().getZone() == null || shelf.getRack().getZone().getWarehouse() == null) {
            throw new RuntimeException("Invalid location hierarchy");
        }
        return shelf.getRack().getZone().getWarehouse().getId();
    }

    private Supplier getSupplierFromCompany(Long supplierId, Company company) {
        if (supplierId == null) {
            throw new RuntimeException("Supplier is required");
        }

        return supplierRepository.findByIdAndCompany(supplierId, company)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }
}
