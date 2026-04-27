package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.wms.dtos.StockRequestDTO;
import com.example.wms.dtos.StockResponseDTO;
import com.example.wms.services.StockService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    // =========================
    // CREATE STOCK (ADMIN or OWNER depending on your rule)
    // =========================
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<StockResponseDTO> create(
            @RequestBody StockRequestDTO request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockService.create(request, authentication.getName()));
    }

    // =========================
    // GET ALL STOCKS (same company scope usually)
    // =========================
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MAGASINIER')")
    public ResponseEntity<List<StockResponseDTO>> getAll(
            Authentication authentication) {

        return ResponseEntity.ok(
                stockService.getAll(authentication.getName())
        );
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MAGASINIER')")
    public ResponseEntity<StockResponseDTO> getById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                stockService.getById(id, authentication.getName())
        );
    }

    // =========================
    // UPDATE STOCK
    // =========================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority( 'ADMIN')")
    public ResponseEntity<StockResponseDTO> update(
            @PathVariable Long id,
            @RequestBody StockRequestDTO request,
            Authentication authentication) {
                 System.out.println("AUTH: " + authentication.getAuthorities());
        return ResponseEntity.ok(
                stockService.update(id, request, authentication.getName())
        );
    }

    // =========================
    // DELETE STOCK
    // =========================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        stockService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MAGASINIER')")
    public ResponseEntity<List<StockResponseDTO>> search(
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) Long rackId,
            @RequestParam(required = false) Long shelfId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                stockService.search(
                        productName,
                        supplierId,
                        warehouseId,
                        zoneId,
                        rackId,
                        shelfId,
                        authentication.getName()
                )
        );
    }
}