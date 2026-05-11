package com.example.wms.dtos;

import com.example.wms.entities.RoleName;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequestDTO {
    private String name;
    private String email;
    private String password;
    private RoleName roleName;
    private Long warehouseId;
}