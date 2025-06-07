from flask import Flask
from scheduler import SchedulerService
from producers.kafka_producer_service import KafkaProducerService
from data_sources.earthquake_source import EarthquakeSource
from jobs.earthquake_job import make_earthquake_job

app = Flask(__name__)

kafka_producer_service = KafkaProducerService(
    bootstrap_servers="localhost:9094")
scheduler_service = SchedulerService()

earthquake_source = EarthquakeSource()
earthquake_job = make_earthquake_job(
    kafka_producer_service, "earthquake-stream", earthquake_source)
scheduler_service.add_job(earthquake_job, interval_seconds=60)


@app.route("/")
def index():
    return {"status": "running"}


if __name__ == "__main__":
    app.run(debug=True)
