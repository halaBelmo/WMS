package com.example.wms.controllers;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.ShelfRequestDTO;
import com.example.wms.dtos.ShelfResponseDTO;
import com.example.wms.services.ShelfService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/shelves")
@RequiredArgsConstructor
public class ShelfController {


    private final ShelfService shelfService;

    @GetMapping
    public List<ShelfResponseDTO> getByRack(@RequestParam Long rackId) {
        return shelfService.getByRack(rackId);
    }

@PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ShelfResponseDTO create(@RequestBody @Valid ShelfRequestDTO dto) {
        return shelfService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ShelfResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid ShelfRequestDTO dto) {
        ShelfResponseDTO updatedShelf = shelfService.update(id, dto);
        return ResponseEntity.ok(updatedShelf);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        shelfService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

