from kafka import KafkaProducer
import json

class KafkaProducerService:
    def __init__(self, bootstrap_servers):
        self._producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8")
        )

    def send(self, topic: str, message: dict):
        self._producer.send(topic, message)
