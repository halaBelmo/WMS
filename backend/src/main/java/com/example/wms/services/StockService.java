package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.StockRequestDTO;
import com.example.wms.dtos.StockResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Location;
import com.example.wms.entities.Product;
import com.example.wms.entities.Stock;
import com.example.wms.entities.User;
import com.example.wms.mappers.StockMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.ProductRepository;
import com.example.wms.repositories.StockRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    // =========================
    // CREATE STOCK
    // =========================
  public StockResponseDTO create(StockRequestDTO dto, String email) {

    User user = getUser(email);
    Company company = user.getCompany();

    Product product = productRepository.findById(dto.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

    Location location = locationRepository.findById(dto.getLocationId())
            .orElseThrow(() -> new RuntimeException("Location not found"));

    // 🔐 company check (IMPORTANT avec warehouse)
    if (!location.getWarehouse().getCompany().getId()
            .equals(company.getId())) {
        throw new RuntimeException("Location not in your company");
    }

    if (!product.getCompany().getId().equals(company.getId())) {
        throw new RuntimeException("Product not in your company");
    }

    // ✅ UTILISATION DU MAPPER
    Stock stock = StockMapper.toEntity(dto, product, location);

    Stock savedStock = stockRepository.save(stock);

    return StockMapper.toDTO(savedStock);
}
    // =========================
    // GET ALL STOCKS (company scope)
    // =========================
    public List<StockResponseDTO> getAll(String email) {

        User user = getUser(email);
        Company company = user.getCompany();

        return stockRepository.findAll()
                .stream()
                .filter(s -> s.getProduct().getCompany().getId().equals(company.getId()))
                .map(StockMapper::toDTO)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================
    public StockResponseDTO getById(Long id, String email) {

        User user = getUser(email);

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        checkAccess(stock, user);

        return StockMapper.toDTO(stock);
    }

    // =========================
    // UPDATE STOCK
    // =========================
    public StockResponseDTO update(Long id, StockRequestDTO dto, String email) {

        User user = getUser(email);

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        checkAccess(stock, user);

        if (dto.getQuantity() != null) {
            stock.setQuantity(dto.getQuantity());
        }

        if (dto.getLocationId() != null) {
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            stock.setLocation(location);
        }

        return StockMapper.toDTO(stockRepository.save(stock));
    }

    // =========================
    // DELETE STOCK
    // =========================
    public void delete(Long id, String email) {

        User user = getUser(email);

        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        checkAccess(stock, user);

        stockRepository.delete(stock);
    }

    // =========================
    // HELPERS
    // =========================

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void checkAccess(Stock stock, User user) {

        if (!stock.getProduct().getCompany().getId()
                .equals(user.getCompany().getId())) {
            throw new RuntimeException("Access denied");
        }
    }
}