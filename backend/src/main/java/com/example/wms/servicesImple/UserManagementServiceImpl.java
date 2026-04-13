package com.example.wms.servicesImple;

import java.util.List;

import com.example.wms.entities.*;
import com.example.wms.repositories.WarehouseRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wms.dtos.CreateUserRequestDTO;
import com.example.wms.dtos.UpdateUserRequestDTO;
import com.example.wms.dtos.UserDTO;
import com.example.wms.mappers.UserMapper;
import com.example.wms.repositories.RoleRepository;
import com.example.wms.repositories.UserRepository;
import com.example.wms.services.UserManagementService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final WarehouseRepository wareHouseRepository;

    @Override
    public UserDTO createUser(CreateUserRequestDTO request, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can create users");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getRoleName() == null) {
            throw new RuntimeException("Role is required");
        }

        if (request.getRoleName() == RoleName.OWNER) {
            throw new RuntimeException("OWNER cannot create another OWNER");
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Company company = owner.getCompany();

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setCompany(company);
        if (request.getWarehouseId() == null) {
            throw new RuntimeException("Warehouse is required");
        }

        WareHouse warehouse = wareHouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if (!warehouse.getCompany().getId().equals(owner.getCompany().getId())) {
            throw new RuntimeException("Warehouse does not belong to your company");
        }

        user.setWarehouse(warehouse);

        User savedUser = userRepository.save(user);

        company.getUsers().add(savedUser);

        return userMapper.toDTO(savedUser);
    }

    @Override
    public UserDTO updateUser(Long userId, UpdateUserRequestDTO request, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can update users");
        }

        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userToUpdate.getCompany() == null || owner.getCompany() == null ||
                !userToUpdate.getCompany().getId().equals(owner.getCompany().getId())) {
            throw new RuntimeException("Access denied: user does not belong to your company");
        }

        if (userToUpdate.getRole() != null && userToUpdate.getRole().getName() == RoleName.OWNER) {
            throw new RuntimeException("OWNER cannot be modified");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(userToUpdate.getEmail())) {

            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }

            userToUpdate.setEmail(request.getEmail());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            userToUpdate.setName(request.getName());
        }

        if (request.getRoleName() != null) {
            if (request.getRoleName() == RoleName.OWNER) {
                throw new RuntimeException("Cannot assign OWNER role");
            }

            Role role = roleRepository.findByName(request.getRoleName())
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            userToUpdate.setRole(role);
        }
        if (request.getWarehouseId() != null) {

            WareHouse warehouse = wareHouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found"));

            if (!warehouse.getCompany().getId().equals(owner.getCompany().getId())) {
                throw new RuntimeException("Warehouse does not belong to your company");
            }

            userToUpdate.setWarehouse(warehouse);
        }

        User updatedUser = userRepository.save(userToUpdate);
        return userMapper.toDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long userId, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can delete users");
        }

        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userToDelete.getCompany() == null || owner.getCompany() == null ||
                !userToDelete.getCompany().getId().equals(owner.getCompany().getId())) {
            throw new RuntimeException("Access denied: user does not belong to your company");
        }

        if (userToDelete.getRole() != null && userToDelete.getRole().getName() == RoleName.OWNER) {
            throw new RuntimeException("OWNER cannot be deleted");
        }

        if (userToDelete.getId().equals(owner.getId())) {
            throw new RuntimeException("OWNER cannot delete himself");
        }

        userRepository.delete(userToDelete);
    }

    @Override
    public List<UserDTO> getCompanyUsers(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (owner.getRole() == null || owner.getRole().getName() != RoleName.OWNER) {
            throw new RuntimeException("Access denied: only OWNER can view company users");
        }

        return owner.getCompany().getUsers()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }
}