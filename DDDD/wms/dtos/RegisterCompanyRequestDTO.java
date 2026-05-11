package com.example.wms.dtos;


import lombok.AllArgsConstructor;
import lombok.Getter;
import  lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor


public class RegisterCompanyRequestDTO {

    private String companyName;
    private String address;
    private String email;
    private String phone;

    private String ownerName;
    private String ownerEmail;
    private String password;

    
}