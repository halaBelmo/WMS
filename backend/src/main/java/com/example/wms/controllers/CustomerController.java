package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.wms.dtos.CustomerRequestDTO;
import com.example.wms.dtos.CustomerResponseDTO;
import com.example.wms.services.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<CustomerResponseDTO> create(
            @RequestBody CustomerRequestDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.create(request, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<List<CustomerResponseDTO>> getAll(Authentication authentication) {
        return ResponseEntity.ok(customerService.getAll(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<CustomerResponseDTO> getById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(customerService.getById(id, authentication.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<CustomerResponseDTO> update(
            @PathVariable Long id,
            @RequestBody CustomerRequestDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(customerService.update(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        customerService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
