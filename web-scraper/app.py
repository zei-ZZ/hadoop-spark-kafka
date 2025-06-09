from flask import Flask
from scheduler import SchedulerService
from producers.kafka_producer_service import KafkaProducerService
from data_sources.earthquake_source import EarthquakeSource
from data_sources.fire_source import FireSource
from jobs.earthquake_job import make_earthquake_job
from jobs.fire_job import make_fire_job
import os

app = Flask(__name__)

bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
earthquake_topic = os.getenv("EARTHQUAKE_TOPIC", "earthquake-stream")
fire_topic = os.getenv("FIRE_TOPIC", "fire-stream")

print("env"+bootstrap_servers)
kafka_producer_service = KafkaProducerService(
    bootstrap_servers=bootstrap_servers)

scheduler_service = SchedulerService()

earthquake_source = EarthquakeSource()
fire_source = FireSource()

earthquake_job = make_earthquake_job(kafka_producer_service, earthquake_topic, earthquake_source)
fire_job = make_fire_job(kafka_producer_service, fire_topic, fire_source)

scheduler_service.add_job(earthquake_job, interval_seconds=60)
scheduler_service.add_job(fire_job, interval_seconds=60)


@app.route("/")
def index():
    return {"status": "running"}


@app.route("/data")
def get_data():
    return {
        "messages": kafka_producer_service.get_messages()
    }



if __name__ == "__main__":
    app.run(debug=True)
