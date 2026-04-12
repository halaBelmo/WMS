package com.example.wms.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.entities.Company;
import com.example.wms.repositories.CompanyRepository;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional
    public void deleteCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        companyRepository.delete(company);
    }
}
