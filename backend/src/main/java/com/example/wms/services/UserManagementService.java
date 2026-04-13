package com.example.wms.services;

import java.util.List;

import com.example.wms.dtos.CreateUserRequestDTO;
import com.example.wms.dtos.UpdateUserRequestDTO;
import com.example.wms.dtos.UserDTO;
import com.example.wms.entities.User;

public interface UserManagementService {
    UserDTO createUser(CreateUserRequestDTO request, String ownerEmail);
    UserDTO updateUser(Long userId, UpdateUserRequestDTO request, String ownerEmail);
    void deleteUser(Long userId, String ownerEmail);
    List<UserDTO> getCompanyUsers(String ownerEmail);
}