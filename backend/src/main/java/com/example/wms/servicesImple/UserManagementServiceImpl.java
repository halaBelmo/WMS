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
    public UserDTO createUser(CreateUserRequestDTO request, String currentUserEmail) {

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        RoleName currentRole = currentUser.getRole().getName();

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (request.getRoleName() == null) {
            throw new RuntimeException("Role is required");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Company company = currentUser.getCompany();
        WareHouse warehouse;

        if (currentRole == RoleName.OWNER) {
            if (request.getWarehouseId() == null) {
                throw new RuntimeException("Warehouse is required");
            }

            warehouse = wareHouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found"));

            if (!warehouse.getCompany().getId().equals(company.getId())) {
                throw new RuntimeException("Warehouse does not belong to your company");
            }

            if (request.getRoleName() == RoleName.OWNER) {
                throw new RuntimeException("OWNER cannot create another OWNER");
            }

        } else if (currentRole == RoleName.ADMIN) {
            if (request.getRoleName() != RoleName.MAGASINIER &&
                    request.getRoleName() != RoleName.RESPONSABLE_STOCK) {
                throw new RuntimeException("ADMIN can only create MAGASINIER or RESPONSABLE_STOCK");
            }

            if (currentUser.getWarehouse() == null) {
                throw new RuntimeException("ADMIN is not assigned to any warehouse");
            }

            // Force admin warehouse, ignore request.warehouseId
            warehouse = currentUser.getWarehouse();

        } else {
            throw new RuntimeException("Access denied");
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setCompany(company);
        user.setWarehouse(warehouse);

        User savedUser = userRepository.save(user);
        company.getUsers().add(savedUser);

        return userMapper.toDTO(savedUser);
    }


    @Override
    public UserDTO updateUser(Long userId, UpdateUserRequestDTO request, String currentUserEmail) {

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoleName currentRole = currentUser.getRole().getName();

        if (!userToUpdate.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new RuntimeException("User does not belong to your company");
        }

        if (userToUpdate.getRole() != null && userToUpdate.getRole().getName() == RoleName.OWNER) {
            throw new RuntimeException("OWNER cannot be modified");
        }

        if (currentRole == RoleName.ADMIN) {
            if (currentUser.getWarehouse() == null || userToUpdate.getWarehouse() == null) {
                throw new RuntimeException("Warehouse assignment is missing");
            }

            if (!userToUpdate.getWarehouse().getId().equals(currentUser.getWarehouse().getId())) {
                throw new RuntimeException("ADMIN can only modify users in his own warehouse");
            }

            if (request.getRoleName() != null &&
                    request.getRoleName() != RoleName.MAGASINIER &&
                    request.getRoleName() != RoleName.RESPONSABLE_STOCK) {
                throw new RuntimeException("ADMIN can only assign MAGASINIER or RESPONSABLE_STOCK");
            }
        } else if (currentRole != RoleName.OWNER) {
            throw new RuntimeException("Access denied");
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

            if (currentRole == RoleName.ADMIN && request.getRoleName() == RoleName.ADMIN) {
                throw new RuntimeException("ADMIN cannot assign ADMIN role");
            }

            Role role = roleRepository.findByName(request.getRoleName())
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            userToUpdate.setRole(role);
        }

        if (request.getWarehouseId() != null) {
            WareHouse warehouse = wareHouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found"));

            if (!warehouse.getCompany().getId().equals(currentUser.getCompany().getId())) {
                throw new RuntimeException("Warehouse does not belong to your company");
            }

            if (currentRole == RoleName.ADMIN &&
                    !warehouse.getId().equals(currentUser.getWarehouse().getId())) {
                throw new RuntimeException("ADMIN can only assign users to his own warehouse");
            }

            userToUpdate.setWarehouse(warehouse);
        }

        User updatedUser = userRepository.save(userToUpdate);
        return userMapper.toDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long userId, String currentUserEmail) {

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoleName currentRole = currentUser.getRole().getName();

        if (!userToDelete.getCompany().getId().equals(currentUser.getCompany().getId())) {
            throw new RuntimeException("User does not belong to your company");
        }

        if (userToDelete.getRole() != null && userToDelete.getRole().getName() == RoleName.OWNER) {
            throw new RuntimeException("OWNER cannot be deleted");
        }

        if (userToDelete.getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot delete yourself");
        }

        if (currentRole == RoleName.ADMIN) {
            if (currentUser.getWarehouse() == null || userToDelete.getWarehouse() == null) {
                throw new RuntimeException("Warehouse assignment is missing");
            }

            if (!userToDelete.getWarehouse().getId().equals(currentUser.getWarehouse().getId())) {
                throw new RuntimeException("ADMIN can only delete users in his own warehouse");
            }

            if (userToDelete.getRole().getName() != RoleName.MAGASINIER &&
                    userToDelete.getRole().getName() != RoleName.RESPONSABLE_STOCK) {
                throw new RuntimeException("ADMIN can only delete MAGASINIER or RESPONSABLE_STOCK");
            }
        } else if (currentRole != RoleName.OWNER) {
            throw new RuntimeException("Access denied");
        }

        userRepository.delete(userToDelete);
    }

    @Override
    public List<UserDTO> getCompanyUsers(String currentUserEmail) {

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        RoleName currentRole = currentUser.getRole().getName();

        if (currentRole == RoleName.OWNER) {
            return currentUser.getCompany().getUsers()
                    .stream()
                    .map(userMapper::toDTO)
                    .toList();
        }

        if (currentRole == RoleName.ADMIN) {
            if (currentUser.getWarehouse() == null) {
                throw new RuntimeException("ADMIN is not assigned to any warehouse");
            }

            return currentUser.getCompany().getUsers()
                    .stream()
                    .filter(user -> user.getWarehouse() != null)
                    .filter(user -> user.getWarehouse().getId().equals(currentUser.getWarehouse().getId()))
                    .map(userMapper::toDTO)
                    .toList();
        }

        throw new RuntimeException("Access denied");
    }
}