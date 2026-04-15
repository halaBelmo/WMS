package com.example.wms.controllers;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.entities.Zone;
import com.example.wms.services.ZoneService;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    public List<Zone> getZones(Authentication authentication) {
        return zoneService.getZones(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('OWNER','ADMIN')")
    public Zone create(@RequestBody Zone zone, Authentication authentication) {
        return zoneService.create(zone, authentication.getName());
    }
}