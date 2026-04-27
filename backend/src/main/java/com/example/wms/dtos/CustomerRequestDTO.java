package com.example.wms.dtos;

import lombok.Data;

@Data
public class CustomerRequestDTO {
    private String name;
    private String address;
    private String phone;
    private String email;
}