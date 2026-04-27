package com.example.wms.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Produit concerné
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Emplacement source : utilisé pour OUT et TRANSFER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_location_id")
    private Location fromLocation;

    // Emplacement destination : utilisé pour IN et TRANSFER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_location_id")
    private Location toLocation;

    private Long quantity;

    @Enumerated(EnumType.STRING)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    private MovementReason movementReason;

    // WAREHOUSE / CUSTOMER / SUPPLIER
    @Enumerated(EnumType.STRING)
    private DestinationType destinationType;

    // ID de warehouse/customer/supplier
    private Long destinationId;

    // PENDING / VALIDATED / REJECTED
    @Enumerated(EnumType.STRING)
    private ValidationStatus status = ValidationStatus.PENDING;

    // Magasinier qui crée le mouvement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    // Admin ou responsable qui valide
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by_id")
    private User validatedBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime validatedAt;

    private String notes;
}