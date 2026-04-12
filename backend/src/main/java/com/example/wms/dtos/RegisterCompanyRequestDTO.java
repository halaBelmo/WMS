package com.example.wms.dtos;


import lombok.Getter;
import lombok.Setter;
@Getter
@Setter

public class RegisterCompanyRequestDTO {

    private String companyName;
    private String address;
    private String email;
    private String phone;

    private String ownerName;
    private String ownerEmail;
    private String password;

    
}