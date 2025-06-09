from kafka import KafkaProducer
import json
import logging

class KafkaProducerService:
    def __init__(self, bootstrap_servers):
        self.logger = logging.getLogger(__name__)
        try: 
            self.logger.info(f"Attempting to connect to Kafka")
            self._producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            self.logger.info("Successfully created Kafka producer")
        except Exception as e:
            self.logger.error(f"Failed to create Kafka producer: {e}")
            raise


    def send(self, topic: str, message: dict):
        try:
            self._producer.send(topic, message)
        except Exception as e:
            self.logger.error(f"Failed to send message")
            raise
