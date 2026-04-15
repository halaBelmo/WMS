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
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.LocationRequestDTO;
import com.example.wms.dtos.LocationResponseDTO;
import com.example.wms.services.LocationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;
    @PostMapping
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    public ResponseEntity<LocationResponseDTO> create(@RequestBody LocationRequestDTO request,
                                                      Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(locationService.create(request, authentication.getName()));
    }
   @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER', 'RESPONSABLE_STOCK')")
    public ResponseEntity<LocationResponseDTO> getById(
        @PathVariable Long id,
        Authentication authentication) {

    return ResponseEntity.ok(
            locationService.getById(id, authentication.getName())
    );
}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    public ResponseEntity<LocationResponseDTO> update(@PathVariable Long id,
                                                      @RequestBody LocationRequestDTO request,
                                                      Authentication authentication) {
        return ResponseEntity.ok(locationService.update(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN')")
    public ResponseEntity<Void> delete(
        @PathVariable Long id,
        Authentication authentication) {

    locationService.delete(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
    @GetMapping
    @PreAuthorize("hasAnyAuthority('OWNER', 'ADMIN', 'MAGASINIER', 'RESPONSABLE_STOCK')")
    public ResponseEntity<List<LocationResponseDTO>> getByWarehouse(
        Authentication authentication) {

    return ResponseEntity.ok(
            locationService.getByWarehouse(authentication.getName())
    );
}
}

