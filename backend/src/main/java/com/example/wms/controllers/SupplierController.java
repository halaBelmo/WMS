package com.example.wms.controllers;
import java.util.List;

import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.SupplierRequestDTO;
import com.example.wms.dtos.SupplierResponseDTO;
import com.example.wms.services.SupplierService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/suppliers")
public class SupplierController {
    
    private final SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('OWNER')")
    public ResponseEntity<SupplierResponseDTO> create(
            @Valid @RequestBody SupplierRequestDTO request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierService.create(request, authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER')")
    public ResponseEntity<SupplierResponseDTO> getById(@PathVariable Long id,
                                                       Authentication authentication) {
        return ResponseEntity.ok(supplierService.getById(id, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER')")
    public ResponseEntity<List<SupplierResponseDTO>> getAll(Authentication authentication) {
        return ResponseEntity.ok(supplierService.getAll(authentication.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER')")
    public ResponseEntity<SupplierResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequestDTO request,
            Authentication authentication) {
        return ResponseEntity.ok(supplierService.update(id, request, authentication.getName()));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER')")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       Authentication authentication) {
        supplierService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER')")
    public ResponseEntity<List<SupplierResponseDTO>> search(
            @RequestParam String name,
            Authentication authentication) {
        return ResponseEntity.ok(supplierService.searchByName(name, authentication.getName()));
    }
    
}
