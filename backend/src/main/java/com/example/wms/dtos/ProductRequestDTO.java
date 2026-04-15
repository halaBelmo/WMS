package com.example.wms.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import  lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ProductRequestDTO {
    private String reference;
    private String nom;
    private String description;
    private String categorie;
    private int quantiteDisponible;
    private String fournisseurId;
    private String emplacementId;
}