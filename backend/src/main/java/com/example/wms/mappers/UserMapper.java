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

            return dto;
        }
    }

