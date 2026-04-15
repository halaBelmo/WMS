package com.example.wms.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import  lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SupplierResponseDTO {
     private Long id;
    private String name;
    private String address;
    private String contact;
    private String phone;
    private String email;
    
}
