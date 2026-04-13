package com.example.wms.services;

import java.util.List;

import com.example.wms.dtos.CreateWareHouseRequestDTO;
import com.example.wms.dtos.UpdateWareHouseRequestDTO;
import com.example.wms.dtos.WareHouseDTO;

public interface WareHouseService {
    WareHouseDTO createWareHouse(CreateWareHouseRequestDTO request, String ownerEmail);
    WareHouseDTO updateWareHouse(Long warehouseId, UpdateWareHouseRequestDTO request, String ownerEmail);
    void deleteWareHouse(Long warehouseId, String ownerEmail);
    List<WareHouseDTO> getCompanyWareHouses(String ownerEmail);
}