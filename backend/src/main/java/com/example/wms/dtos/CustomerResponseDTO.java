package com.example.wms.dtos;

import lombok.Data;

@Data
public class CustomerResponseDTO {
    private Long id;
    private String name;
    private String code;
    private String address;
    private String phone;
    private String email;
}