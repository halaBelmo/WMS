package com.example.wms.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import com.example.wms.events.StockMovementEvent;

@Configuration
public class KafkaConfig {

    @Bean
    public ProducerFactory<String, StockMovementEvent> producerFactory() {

        Map<String, Object> config = new HashMap<>();

        // Kafka broker
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");

        // Key serializer (String = productId, etc.)
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

        // Value serializer (JSON for your event)
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // Important: avoid adding type headers issues (optional but recommended)
        config.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, StockMovementEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}