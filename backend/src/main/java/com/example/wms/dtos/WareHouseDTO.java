package com.example.wms.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WareHouseDTO {
    private Long id;
    private String name;
    private String location;
    private String companyName;
}