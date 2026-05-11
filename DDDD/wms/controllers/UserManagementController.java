package com.example.wms.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wms.dtos.CreateUserRequestDTO;
import com.example.wms.dtos.UpdateUserRequestDTO;
import com.example.wms.dtos.UserDTO;
import com.example.wms.services.UserManagementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owner/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequestDTO request,
                                              Authentication authentication) {
        String ownerEmail = authentication.getName();
        UserDTO createdUser = userManagementService.createUser(request, ownerEmail);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                              @RequestBody UpdateUserRequestDTO request,
                                              Authentication authentication) {
        String ownerEmail = authentication.getName();
        UserDTO updatedUser = userManagementService.updateUser(id, request, ownerEmail);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id,
                                             Authentication authentication) {
        String ownerEmail = authentication.getName();
        userManagementService.deleteUser(id, ownerEmail);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getCompanyUsers(Authentication authentication) {
        String ownerEmail = authentication.getName();
        List<UserDTO> users = userManagementService.getCompanyUsers(ownerEmail);
        return ResponseEntity.ok(users);
    }
}