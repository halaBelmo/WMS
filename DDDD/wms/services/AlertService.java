package com.example.wms.services;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wms.entities.Alert;
import com.example.wms.repositories.AlertRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public void createAlert(Long productId, String message) {

        Alert alert = new Alert();
        alert.setProductId(productId);
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setSeen(false);

        alertRepository.save(alert);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public List<Alert> getUnseenAlerts() {
        return alertRepository.findBySeenFalse();
    }

    public void markAsSeen(Long id) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setSeen(true);
        alertRepository.save(alert);
    }
}