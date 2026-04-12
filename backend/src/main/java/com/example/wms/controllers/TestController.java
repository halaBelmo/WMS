package com.example.wms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.wms.services.CompanyService;

@RestController
@RequestMapping("/test")

public class TestController {
    @RequestMapping("/")
    public String test() {
        return "Hello, World!";
    }
    private final CompanyService companyService;

    public TestController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
