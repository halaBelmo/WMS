package com.example.wms.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.LoginRequestDTO;
import com.example.wms.dtos.RegisterCompanyRequestDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Role;
import com.example.wms.entities.RoleName;
import com.example.wms.entities.User;
import com.example.wms.mappers.CompanyMapper;
import com.example.wms.mappers.UserMapper;
import com.example.wms.repositories.CompanyRepository;
import com.example.wms.repositories.RoleRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service

@RequiredArgsConstructor

@Transactional

public class AuthService {

    private final CompanyRepository companyRepository;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final AuthenticationManager authenticationManager;

    private final PasswordEncoder passwordEncoder;

    private final UserMapper userMapper;

    private final CompanyMapper companyMapper;

    @Autowired

    private JWTService jwtService;

    // =====================================================

    // REGISTER COMPANY + OWNER (ONLY)

    // =====================================================

    public Map<String, Object> registerCompany(RegisterCompanyRequestDTO req) {

        System.out.println("REGISTER COMPANY SERVICE REACHED");

        if (companyRepository.findByEmail(req.getEmail()).isPresent()) {

            throw new RuntimeException("Company email already exists");

        }

        if (userRepository.findByEmail(req.getOwnerEmail()).isPresent()) {

            throw new RuntimeException("Owner email already exists");

        }

        Company company = new Company();

        company.setName(req.getCompanyName());

        company.setAddress(req.getAddress());

        company.setEmail(req.getEmail());

        company.setPhone(req.getPhone());

        company = companyRepository.save(company);

        Role ownerRole = roleRepository.findByName(RoleName.OWNER)

                .orElseThrow(() -> new RuntimeException("OWNER role not found"));

        User owner = new User();

        owner.setName(req.getOwnerName());

        owner.setEmail(req.getOwnerEmail());

        owner.setPassword(passwordEncoder.encode(req.getPassword()));

        owner.setRole(ownerRole);

        owner.setCompany(company);

        owner = userRepository.save(owner);

        company.setOwner(owner);

        company.getUsers().add(owner);

        company = companyRepository.save(company);

        return Map.of(

                "message", "Company and Owner created successfully",

                "company", companyMapper.toDTO(company),

                "owner", userMapper.toDTO(owner)

        );

    }

    public Map<String, Object> login(LoginRequestDTO request) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getEmail(),

                        request.getPassword()

                )

        );

        User user = userRepository.findByEmail(request.getEmail())

                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(

               user

        );

        return Map.of(

                "message", "Login successful",

                "token", token,

                "user", userMapper.toDTO(user)

        );

    }

}
