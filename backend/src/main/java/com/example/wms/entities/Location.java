package com.example.wms.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "locations")

public class Location {
   
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;


    private String nom;

    private String zone;

    private String rack;

    private String etager;

    @ManyToOne
    private WareHouse wareHouse;

    @OneToMany(mappedBy = "location")
    private java.util.List<Product> products;


}
