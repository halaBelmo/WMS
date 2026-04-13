package com.example.wms.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
<<<<<<< HEAD

import java.util.ArrayList;
import java.util.List;

=======
>>>>>>> 9dbf580a71130817753f87710d72e00b6325efe0
@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class WareHouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

<<<<<<< HEAD
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL)
    private List<User> users = new ArrayList<>();

=======
     @OneToMany(mappedBy = "wareHouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Location> locations;
>>>>>>> 9dbf580a71130817753f87710d72e00b6325efe0
}
