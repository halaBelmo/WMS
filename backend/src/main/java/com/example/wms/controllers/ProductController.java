package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.ProductRequestDTO;
import com.example.wms.dtos.ProductResponseDTO;
import com.example.wms.services.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owner/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // =========================
    // CREATE (OWNER only)
    // =========================
    @PreAuthorize("hasAuthority('OWNER')")
    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(
            @RequestBody ProductRequestDTO dto,
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.create(dto, authentication.getName())
        );
    }

    // =========================
    // GET ALL (OWNER + ADMIN + MAGASINIER)
    // =========================
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER')")
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAll(
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.getAll(authentication.getName())
        );
    }

    // =========================
    // GET BY ID
    // =========================
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.getById(id, authentication.getName())
        );
    }

    // =========================
    // UPDATE (OWNER only)
    // =========================
    @PreAuthorize("hasAuthority('OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(
            @PathVariable Long id,
            @RequestBody ProductRequestDTO dto,
            Authentication authentication) {

        return ResponseEntity.ok(
                productService.update(id, dto, authentication.getName())
        );
    }

    // =========================
    // DELETE (OWNER only)
    // =========================
    @PreAuthorize("hasAuthority('OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        productService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}