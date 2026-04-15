package com.example.wms.mappers;

import com.example.wms.dtos.UserDTO;
import com.example.wms.entities.User;
import org.springframework.stereotype.Component;
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
            if (user.getWarehouse() != null) {
                dto.setWarehouseName(user.getWarehouse().getName());
                dto.setWarehouseId(user.getWarehouse().getId()); // add this
            }




            return dto;
        }
    }

