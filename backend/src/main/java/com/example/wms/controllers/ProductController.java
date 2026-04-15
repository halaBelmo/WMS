package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.wms.dtos.ProductRequestDTO;
import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.services.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    // CREATE
    @PostMapping
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    public ResponseEntity<ProductResponseDTO> create(
            @RequestBody ProductRequestDTO request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(request, authentication.getName()));
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    public ResponseEntity<ProductResponseDTO> update(
            @PathVariable Long id,
            @RequestBody ProductRequestDTO request,
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.update(id, request, authentication.getName())
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        productService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // GET ALL BY WAREHOUSE (USER CONTEXT)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER', 'RESPONSABLE_STOCK')")
    public ResponseEntity<List<ProductResponseDTO>> getByWarehouse(
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.getByWarehouse(authentication.getName())
        );
    }

    // GET BY ID (OPTIONAL BUT PRO)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER', 'RESPONSABLE_STOCK')")
    public ResponseEntity<ProductResponseDTO> getById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.getById(id, authentication.getName())
        );
    }
}