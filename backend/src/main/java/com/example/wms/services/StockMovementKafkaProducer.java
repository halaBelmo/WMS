package com.example.wms.services;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.example.wms.events.StockMovementEvent;

@Service
public class StockMovementKafkaProducer {

    private final KafkaTemplate<String, StockMovementEvent> kafkaTemplate;

    public StockMovementKafkaProducer(KafkaTemplate<String, StockMovementEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendStockMovement(StockMovementEvent event) {
       kafkaTemplate.send(
    "stock-movements",
    event.getProductId().toString(),
    event
);
    }
}