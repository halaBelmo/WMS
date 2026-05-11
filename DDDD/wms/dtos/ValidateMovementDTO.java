package com.example.wms.dtos;

import com.example.wms.entities.ValidationStatus;

import lombok.Data;

@Data
public class ValidateMovementDTO {

    // VALIDATED ou REJECTED
    private ValidationStatus status;
}