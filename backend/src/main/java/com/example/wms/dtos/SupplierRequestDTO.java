package com.example.wms.dtos;


import lombok.AllArgsConstructor;
import lombok.Getter;
import  lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class SupplierRequestDTO {

    private String name;

    private String address;

    private String contact;

    private String phone;

    private String email;
}