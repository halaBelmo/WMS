package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.ProductRequestDTO;
import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Product;
import com.example.wms.entities.Supplier;
import com.example.wms.entities.User;
import com.example.wms.mappers.ProductMapper;
import com.example.wms.repositories.ProductRepository;
import com.example.wms.repositories.SupplierRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    // =========================
    // CREATE
    // =========================
    public ProductResponseDTO create(ProductRequestDTO dto, String email) {

        User user = getUserByEmail(email);
        Company company = user.getCompany();

        checkOwner(user);

        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
        }

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCompany(company);
        product.setSupplier(supplier);

        return ProductMapper.toDTO(productRepository.save(product));
    }

    // =========================
    // GET ALL
    // =========================
    public List<ProductResponseDTO> getAll(String email) {

        User user = getUserByEmail(email);

        return productRepository.findByCompanyId(user.getCompany().getId())
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================
    public ProductResponseDTO getById(Long id, String email) {

        User user = getUserByEmail(email);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        checkCompanyAccess(product, user);

        return ProductMapper.toDTO(product);
    }

    // =========================
    // UPDATE
    // =========================
    public ProductResponseDTO update(Long id, ProductRequestDTO dto, String email) {

        User user = getUserByEmail(email);
        checkOwner(user);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());

        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(supplier);
        }

        return ProductMapper.toDTO(productRepository.save(product));
    }

    // =========================
    // DELETE
    // =========================
    public void delete(Long id, String email) {

        User user = getUserByEmail(email);
        checkOwner(user);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }

    // =========================
    // HELPERS
    // =========================
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void checkOwner(User user) {
        if (!user.getCompany().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Only OWNER allowed");
        }
    }

    private void checkCompanyAccess(Product product, User user) {
        if (!product.getCompany().getId().equals(user.getCompany().getId())) {
            throw new RuntimeException("Access denied");
        }
    }
}