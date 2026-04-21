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

import com.example.wms.dtos.ZoneRequestDTO;
import com.example.wms.dtos.ZoneResponseDTO;
import com.example.wms.entities.Zone;
import com.example.wms.mappers.ZoneMapper;
import com.example.wms.services.ZoneService;

import lombok.RequiredArgsConstructor;




@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;
    private final ZoneMapper zoneMapper;

@GetMapping
    public List<ZoneResponseDTO> getZones(Authentication authentication) {
        List<Zone> zones = zoneService.getZones(authentication.getName());
        return zoneMapper.toDTOList(zones);
    }

@PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public Zone create(@RequestBody Zone zone, Authentication authentication) {
        return zoneService.create(zone, authentication.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ZoneResponseDTO> update(
            @PathVariable Long id,
            @RequestBody ZoneRequestDTO request,
            Authentication authentication) {
        Zone updatedZone = zoneService.update(id, request, authentication.getName());
        return ResponseEntity.ok(zoneMapper.toDTO(updatedZone));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        zoneService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
