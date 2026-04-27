package com.example.wms.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.StockMovementRequestDTO;
import com.example.wms.dtos.StockMovementResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Location;
import com.example.wms.entities.MovementType;
import com.example.wms.entities.Product;
import com.example.wms.entities.Stock;
import com.example.wms.entities.StockMovement;
import com.example.wms.entities.User;
import com.example.wms.entities.ValidationStatus;
import com.example.wms.mappers.StockMovementMapper;
import com.example.wms.repositories.LocationRepository;
import com.example.wms.repositories.ProductRepository;
import com.example.wms.repositories.StockMovementRepository;
import com.example.wms.repositories.StockRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository movementRepository;
    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    // Magasinier crée une demande => PENDING
    public StockMovementResponseDTO createMovement(StockMovementRequestDTO dto, String email) {

        User user = getUser(email);
        Company company = user.getCompany();

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("Product not in your company");
        }

        Location fromLocation = null;
        Location toLocation = null;

        if (dto.getFromLocationId() != null) {
            fromLocation = locationRepository.findById(dto.getFromLocationId())
                    .orElseThrow(() -> new RuntimeException("From location not found"));

            checkLocationCompany(fromLocation, company);
        }

        if (dto.getToLocationId() != null) {
            toLocation = locationRepository.findById(dto.getToLocationId())
                    .orElseThrow(() -> new RuntimeException("To location not found"));

            checkLocationCompany(toLocation, company);
        }

        StockMovement movement = StockMovementMapper.toEntity(
                dto,
                product,
                fromLocation,
                toLocation,
                user
        );

        movement.setStatus(ValidationStatus.PENDING);
        movement.setCreatedAt(LocalDateTime.now());

        return StockMovementMapper.toDTO(movementRepository.save(movement));
    }

    // Admin récupère les mouvements en attente
    public List<StockMovementResponseDTO> getPendingMovements(String email) {

        User user = getUser(email);
        Long companyId = user.getCompany().getId();

        return movementRepository.findAll()
                .stream()
                .filter(m -> m.getProduct().getCompany().getId().equals(companyId))
                .filter(m -> m.getStatus() == ValidationStatus.PENDING)
                .map(StockMovementMapper::toDTO)
                .toList();
    }

    // Admin valide => update table stocks
    @Transactional
    public StockMovementResponseDTO validateMovement(Long movementId, String adminEmail) {

        User admin = getUser(adminEmail);

        StockMovement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new RuntimeException("Movement not found"));

        checkMovementCompany(movement, admin.getCompany());

        if (movement.getStatus() != ValidationStatus.PENDING) {
            throw new RuntimeException("Movement already processed");
        }

        if (movement.getMovementType() == MovementType.OUT) {
            applyOutMovement(movement);
        }

        if (movement.getMovementType() == MovementType.IN) {
            applyInMovement(movement);
        }

        if (movement.getMovementType() == MovementType.TRANSFER) {
            applyTransferMovement(movement);
        }

        movement.setStatus(ValidationStatus.VALIDATED);
        movement.setValidatedBy(admin);
        movement.setValidatedAt(LocalDateTime.now());

        return StockMovementMapper.toDTO(movementRepository.save(movement));
    }

    // Admin refuse => stock ne change pas
    public StockMovementResponseDTO rejectMovement(Long movementId, String adminEmail) {

        User admin = getUser(adminEmail);

        StockMovement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new RuntimeException("Movement not found"));

        checkMovementCompany(movement, admin.getCompany());

        if (movement.getStatus() != ValidationStatus.PENDING) {
            throw new RuntimeException("Movement already processed");
        }

        movement.setStatus(ValidationStatus.REJECTED);
        movement.setValidatedBy(admin);
        movement.setValidatedAt(LocalDateTime.now());

        return StockMovementMapper.toDTO(movementRepository.save(movement));
    }

    // =========================
    // PRIVATE METHODS
    // =========================

    private void applyOutMovement(StockMovement movement) {

        if (movement.getFromLocation() == null) {
            throw new RuntimeException("From location is required for OUT movement");
        }

        Stock stock = getStock(
                movement.getProduct().getId(),
                movement.getFromLocation().getId()
        );

        if (stock.getQuantity() < movement.getQuantity()) {
            throw new RuntimeException("Not enough stock");
        }

        stock.setQuantity(stock.getQuantity() - movement.getQuantity());
        stockRepository.save(stock);
    }

    private void applyInMovement(StockMovement movement) {

        if (movement.getToLocation() == null) {
            throw new RuntimeException("To location is required for IN movement");
        }

        Stock stock = stockRepository
                .findByProductIdAndLocationId(
                        movement.getProduct().getId(),
                        movement.getToLocation().getId()
                )
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setProduct(movement.getProduct());
                    newStock.setLocation(movement.getToLocation());
                    newStock.setQuantity(0L);
                    return newStock;
                });

        stock.setQuantity(stock.getQuantity() + movement.getQuantity());
        stockRepository.save(stock);
    }

    private void applyTransferMovement(StockMovement movement) {

        if (movement.getFromLocation() == null || movement.getToLocation() == null) {
            throw new RuntimeException("From and To locations are required for TRANSFER");
        }

        applyOutMovement(movement);
        applyInMovement(movement);
    }

    private Stock getStock(Long productId, Long locationId) {
        return stockRepository.findByProductIdAndLocationId(productId, locationId)
                .orElseThrow(() -> new RuntimeException("Stock not found in this location"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void checkLocationCompany(Location location, Company company) {
        if (!location.getWarehouse().getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("Location not in your company");
        }
    }

    private void checkMovementCompany(StockMovement movement, Company company) {
        if (!movement.getProduct().getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("Access denied");
        }
    }
}