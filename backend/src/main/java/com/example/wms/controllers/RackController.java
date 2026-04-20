package com.example.wms.controllers;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.RackRequestDTO;
import com.example.wms.dtos.RackResponseDTO;
import com.example.wms.services.RackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/racks")
@RequiredArgsConstructor
public class RackController {

    private final RackService rackService;

    @GetMapping
    public List<RackResponseDTO> getByZone(@RequestParam Long zoneId,
                                 Authentication authentication) {
        return rackService.getByZone(zoneId, authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public RackResponseDTO create(@RequestBody @Valid RackRequestDTO dto) {
        return rackService.create(dto);
    }
}

