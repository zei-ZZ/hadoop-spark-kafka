import requests
from data_sources.disaster_source import DisasterDataSource


class EarthquakeSource(DisasterDataSource):
    def __init__(self):
        self.api_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
        self.latest_timestamp = 0

    def fetch_new_data(self):
        response = requests.get(self.api_url, timeout=10)
        response.raise_for_status()
        data = response.json()

        new_items = [item for item in data["features"]
                     if item["properties"]["time"] > self.latest_timestamp]

        if new_items:
            self.latest_timestamp = max(item["properties"]["time"]
                                        for item in new_items)

        return new_items
