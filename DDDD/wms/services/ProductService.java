package com.example.wms.services;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.ProductRequestDTO;
import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Product;
import com.example.wms.entities.RoleName;
import com.example.wms.entities.Supplier;
import com.example.wms.entities.User;
import com.example.wms.mappers.ProductMapper;
import com.example.wms.repositories.ProductRepository;
import com.example.wms.repositories.StockMovementRepository;
import com.example.wms.repositories.StockRepository;
import com.example.wms.repositories.SupplierRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public ProductResponseDTO create(ProductRequestDTO dto, String email) {
        User user = getUserByEmail(email);
        Company company = user.getCompany();

        checkOwnerByRole(user);

        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            checkSupplierCompanyAccess(supplier, user);
        }

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCompany(company);
        product.setSupplier(supplier);

        return ProductMapper.toDTO(productRepository.save(product));
    }

    public List<ProductResponseDTO> getAll(String email) {
        User user = getUserByEmail(email);

        return productRepository.findByCompanyId(user.getCompany().getId())
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    public ProductResponseDTO getById(Long id, String email) {
        User user = getUserByEmail(email);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        checkProductCompanyAccess(product, user);

        return ProductMapper.toDTO(product);
    }

    public ProductResponseDTO update(Long id, ProductRequestDTO dto, String email) {
        User user = getUserByEmail(email);
        checkOwnerByRole(user);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        checkProductCompanyAccess(product, user);

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());

        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            checkSupplierCompanyAccess(supplier, user);
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }

        return ProductMapper.toDTO(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id, String email) {
        User user = getUserByEmail(email);
        checkOwnerByRole(user);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        checkProductCompanyAccess(product, user);

        stockMovementRepository.deleteByProductId(product.getId());
        stockRepository.deleteByProductId(product.getId());
        productRepository.delete(product);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void checkOwnerByRole(User user) {
        if (user.getRole() == null || user.getRole().getName() != RoleName.OWNER) {
            throw new AccessDeniedException("Only OWNER allowed");
        }
    }

    private void checkProductCompanyAccess(Product product, User user) {
        if (product.getCompany() == null || user.getCompany() == null) {
            throw new AccessDeniedException("Access denied");
        }

        if (!product.getCompany().getId().equals(user.getCompany().getId())) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private void checkSupplierCompanyAccess(Supplier supplier, User user) {
        if (supplier.getCompany() == null || user.getCompany() == null) {
            throw new AccessDeniedException("Access denied");
        }

        if (!supplier.getCompany().getId().equals(user.getCompany().getId())) {
            throw new AccessDeniedException("Access denied");
        }
    }
}
