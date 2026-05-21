package com.example.wms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.MovementSimulationRequestDTO;
import com.example.wms.dtos.MovementSimulationResponseDTO;
import com.example.wms.services.MovementSimulationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulator")
public class MovementSimulationController {

    private final MovementSimulationService movementSimulationService;

    @PostMapping("/movements")
    @PreAuthorize("hasAnyAuthority('OWNER','ROLE_OWNER','ADMIN','ROLE_ADMIN','MAGASINIER','ROLE_MAGASINIER')")
    public ResponseEntity<MovementSimulationResponseDTO> simulateMovements(
            @RequestBody(required = false) MovementSimulationRequestDTO request,
            Authentication authentication
    ) {
        MovementSimulationRequestDTO simulationRequest = request != null
                ? request
                : new MovementSimulationRequestDTO();

        return ResponseEntity.ok(
                movementSimulationService.simulate(simulationRequest, authentication.getName())
        );
    }
}
