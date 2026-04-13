package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.WareHouseDTO;
import com.example.wms.entities.WareHouse;

@Component
public class WareHouseMapper {

    public WareHouseDTO toDTO(WareHouse warehouse) {
        if (warehouse == null) return null;

        WareHouseDTO dto = new WareHouseDTO();
        dto.setId(warehouse.getId());
        dto.setName(warehouse.getName());
        dto.setLocation(warehouse.getLocation());

        if (warehouse.getCompany() != null) {
            dto.setCompanyName(warehouse.getCompany().getName());
        }

        return dto;
    }
}