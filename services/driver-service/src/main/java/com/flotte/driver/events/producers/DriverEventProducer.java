package com.flotte.driver.events.producers;

import com.flotte.driver.events.DriverPayload;
import com.flotte.driver.events.KafkaEventEnvelope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class DriverEventProducer {

    private static final Logger log = LoggerFactory.getLogger(DriverEventProducer.class);
    private static final String TOPIC = "flotte.conducteurs.events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public DriverEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishDriverEvent(KafkaEventEnvelope<DriverPayload> event) {
        String key = event.payload().driverId().toString();
        kafkaTemplate.send(TOPIC, key, event);
        log.info("Kafka event publié sur {} → type={} driverId={}", TOPIC, event.eventType(), key);
    }
}