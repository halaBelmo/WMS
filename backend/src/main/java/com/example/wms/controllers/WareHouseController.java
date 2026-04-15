package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.CreateWareHouseRequestDTO;
import com.example.wms.dtos.UpdateWareHouseRequestDTO;
import com.example.wms.dtos.WareHouseDTO;
import com.example.wms.services.WareHouseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owner/warehouses")
@RequiredArgsConstructor
public class WareHouseController {

    private final WareHouseService wareHouseService;

    @PostMapping("/")
    public ResponseEntity<WareHouseDTO> createWareHouse(@RequestBody CreateWareHouseRequestDTO request,
                                                        Authentication authentication) {
        String ownerEmail = authentication.getName();
        WareHouseDTO createdWarehouse = wareHouseService.createWareHouse(request, ownerEmail);
        return ResponseEntity.ok(createdWarehouse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareHouseDTO> updateWareHouse(@PathVariable Long id,
                                                        @RequestBody UpdateWareHouseRequestDTO request,
                                                        Authentication authentication) {
        String ownerEmail = authentication.getName();
        WareHouseDTO updatedWarehouse = wareHouseService.updateWareHouse(id, request, ownerEmail);
        return ResponseEntity.ok(updatedWarehouse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWareHouse(@PathVariable Long id,
                                                  Authentication authentication) {
        String ownerEmail = authentication.getName();
        wareHouseService.deleteWareHouse(id, ownerEmail);
        return ResponseEntity.ok("Warehouse deleted successfully");
    }

    @GetMapping
    public ResponseEntity<List<WareHouseDTO>> getCompanyWareHouses(Authentication authentication) {
        String ownerEmail = authentication.getName();
        List<WareHouseDTO> warehouses = wareHouseService.getCompanyWareHouses(ownerEmail);
        return ResponseEntity.ok(warehouses);
    }
}