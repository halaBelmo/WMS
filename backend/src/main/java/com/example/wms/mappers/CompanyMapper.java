package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.CompanyDTO;
import com.example.wms.entities.Company;

@Component
public class CompanyMapper {
    
    public CompanyDTO toDTO(Company company) {
        if (company == null) return null;
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setEmail(company.getEmail());
        return dto;
    }
}
