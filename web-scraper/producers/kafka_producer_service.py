from kafka import KafkaProducer
import json
import logging
class KafkaProducerService:
    def __init__(self, bootstrap_servers):
        self.logger = logging.getLogger(__name__)
        self.messages = []  # Store messages in memory
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
            self.messages.append({"topic": topic, "message": message})
            self._producer.send(topic, message)
        except Exception as e:
            self.logger.error(f"Failed to send message")
            raise

    def get_messages(self, limit=100):
        return self.messages[-limit:]  # Return last N messages

