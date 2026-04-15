package com.example.wms.mappers;

import org.springframework.stereotype.Component;

import com.example.wms.dtos.UserDTO;
import com.example.wms.entities.User;
@Component
public class UserMapper {
        public UserDTO toDTO(User user) {
            if (user == null) return null;

            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole().getName().name());
            if (user.getWarehouse() != null) {
                dto.setWarehouseName(user.getWarehouse().getName());
            }
            if (user.getCompany() != null) {
                dto.setCompanyName(user.getCompany().getName());
            }
<<<<<<< HEAD
=======
            if (user.getWarehouse() != null) {
                dto.setWarehouseName(user.getWarehouse().getName());
                dto.setWarehouseId(user.getWarehouse().getId()); // add this
            }




>>>>>>> fa927680a1dd60f3bb30d122615933decd33d3d1
            return dto;
        }
    }

