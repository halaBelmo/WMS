package com.example.wms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.dtos.CustomerRequestDTO;
import com.example.wms.dtos.CustomerResponseDTO;
import com.example.wms.entities.Company;
import com.example.wms.entities.Customer;
import com.example.wms.entities.User;
import com.example.wms.repositories.CustomerRepository;
import com.example.wms.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerResponseDTO create(CustomerRequestDTO dto, String email) {
        User user = getUser(email);
        Company company = user.getCompany();

        if (dto.getEmail() != null && customerRepository.existsByEmailAndCompany(dto.getEmail(), company)) {
            throw new RuntimeException("Customer email already exists");
        }

        Customer customer = Customer.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .company(company)
                .build();

        return toDTO(customerRepository.save(customer));
    }

    public List<CustomerResponseDTO> getAll(String email) {
        User user = getUser(email);

        return customerRepository.findByCompany(user.getCompany())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public CustomerResponseDTO getById(Long id, String email) {
        User user = getUser(email);

        Customer customer = customerRepository.findByIdAndCompany(id, user.getCompany())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return toDTO(customer);
    }

    public CustomerResponseDTO update(Long id, CustomerRequestDTO dto, String email) {
        User user = getUser(email);

        Customer customer = customerRepository.findByIdAndCompany(id, user.getCompany())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setName(dto.getName());
        customer.setAddress(dto.getAddress());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());

        return toDTO(customerRepository.save(customer));
    }

    public void delete(Long id, String email) {
        User user = getUser(email);

        Customer customer = customerRepository.findByIdAndCompany(id, user.getCompany())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customerRepository.delete(customer);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CustomerResponseDTO toDTO(Customer customer) {
        CustomerResponseDTO dto = new CustomerResponseDTO();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setAddress(customer.getAddress());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        return dto;
    }
}