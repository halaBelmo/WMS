package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.wms.dtos.StockMovementRequestDTO;
import com.example.wms.dtos.StockMovementResponseDTO;
import com.example.wms.services.StockMovementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    // Magasinier crée une demande de mouvement => PENDING
    @PostMapping
    @PreAuthorize("hasAnyAuthority('MAGASINIER','ROLE_MAGASINIER')")
    public ResponseEntity<StockMovementResponseDTO> createMovement(
            @RequestBody StockMovementRequestDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockMovementService.createMovement(request, authentication.getName()));
    }

    // Admin voit les demandes en attente
    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<List<StockMovementResponseDTO>> getPendingMovements(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                stockMovementService.getPendingMovements(authentication.getName())
        );
    }

    // Admin valide une demande => update stocks
    @PutMapping("/{id}/validate")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<StockMovementResponseDTO> validateMovement(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                stockMovementService.validateMovement(id, authentication.getName())
        );
    }

    // Admin refuse une demande => stocks ne changent pas
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<StockMovementResponseDTO> rejectMovement(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                stockMovementService.rejectMovement(id, authentication.getName())
        );
    }
}
