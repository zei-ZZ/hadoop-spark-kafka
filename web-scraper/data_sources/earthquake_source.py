import requests
from data_sources.disaster_source import DisasterDataSource
from datetime import datetime

class EarthquakeSource(DisasterDataSource):
    quakes = []
    def __init__(self):
        self.api_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

    def fetch_new_data(self):
        try:
            response = requests.get(self.api_url)
            data = response.json()

            for feature in data['features']:
                    quake_id = feature['id']
                    props = feature['properties']
                    timestamp_ms = props['time']
                    formatted_time = datetime.fromtimestamp(timestamp_ms / 1000).strftime("%Y-%m-%d %H:%M:%S")
                    
                    # Add relevant info to new_quakes
                    quake_info = {
                        "id": quake_id,
                        "time": feature['properties']['time'],
                        'magnitude': props.get('mag'),
                        'place': props.get('place'),
                        'time': formatted_time,
                        'url': props.get('url'),
                        'type': props.get('type'),
                        'status': props.get('status'),
                        'magType': props.get('magType')
                    }
                    self.quakes.append(quake_info)
            
            return self.quakes
        except Exception as e:
            print(f"Error fetching earthquakes: {e}")
            return []
