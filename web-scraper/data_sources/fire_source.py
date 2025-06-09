import requests
from data_sources.disaster_source import DisasterDataSource
from helpers.geo_coder import GeoCoder

from datetime import datetime, timedelta
import logging
import csv
import time
from geopy.geocoders import Nominatim

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FireSource(DisasterDataSource):
    fires = []
    def __init__(self):
        today = datetime.utcnow().strftime("%Y-%m-%d")
        self.api_url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/477785c4a607ad274bbbb9cbdcdd6bef/VIIRS_SNPP_NRT/world/1/{today}"

    def process_batch(rows, headers, three_hours_ago, numberOfMinutes):
        """
        Process a batch of fire detection data and convert it into structured fire events.
        
        Args:
            rows (list): List of rows containing fire detection data
            headers (list): Column headers for the data
            three_hours_ago (datetime): Timestamp for filtering recent fires
            numberOfMinutes (int): Time window in minutes for filtering fires
            
        Returns:
            list: List of processed fire events with location and metadata
        """
        fire_events = []
        geo_coder = GeoCoder()
        for row in rows:
            try:
                # Convert row data to dictionary using headers
                fire_data = dict(zip(headers, row))
                acq_date = fire_data.get('acq_date')
                acq_time = fire_data.get('acq_time')

                # Skip rows with missing date or time
                if not (acq_date and acq_time):
                    continue

                # Parse timestamp and filter based on time window
                fire_dt = datetime.strptime(f"{acq_date} {acq_time.zfill(4)}", "%Y-%m-%d %H%M")
                if (three_hours_ago - fire_dt).total_seconds() > (numberOfMinutes * 60):
                    continue

                # Extract and process location data
                latitude = fire_data.get('latitude')
                longitude = fire_data.get('longitude')
                try:
                    city, country = geo_coder.get_location_info(float(latitude), float(longitude))
                except Exception as e:
                    logger.warning(f"Error getting location info: {e}")
                    city, country = "Unknown", "Unknown"

                # Create structured fire event
                fire_events.append({
                    "id": f"{latitude}_{longitude}_{acq_date}_{acq_time}",
                    "time": fire_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "latitude": latitude,
                    "longitude": longitude,
                    "country": country,
                    "city": city,
                    "frp": float(fire_data.get('frp', 0)),  # Fire Radiative Power
                    "type": "fire"
                })
            except Exception as e:
                logger.warning(f"Error processing fire row: {e}")
                
        return fire_events

    def fetch_new_data(self, numberOfMinutes=1, max_retries=3):
        """
        Fetch fire data from NASA FIRMS API.
        
        Args:
            numberOfMinutes (int): Number of minutes of data to fetch
            max_retries (int): Maximum number of retry attempts
            
        Returns:
            list: List of fire events
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching fires from {numberOfMinutes} minutes ago (Attempt {attempt + 1}/{max_retries})")
                
                # Make API request with timeout
                response = requests.get(self.api_url, timeout=30, verify=False)
                if response.status_code != 200:
                    logger.error(f"Failed to fetch fire data. Status code: {response.status_code}")
                    if attempt < max_retries - 1:
                        time.sleep(5)
                        continue
                    return []

                # Process CSV response
                decoded_content = response.content.decode('utf-8')
                cr = csv.reader(decoded_content.splitlines(), delimiter=',')
                headers = next(cr)
                all_rows = list(cr)
                
                # Process fires within specified time window
                three_hours_ago = datetime.utcnow() - timedelta(hours=3)
                fire_events = self.process_batch(all_rows, headers, three_hours_ago, numberOfMinutes)
                
                logger.info(f"Processed {len(all_rows)} rows and found {len(fire_events)} new fire events")
                return fire_events

            except requests.exceptions.Timeout:
                logger.error(f"Timeout while fetching fire data (Attempt {attempt + 1}/{max_retries})")
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching fire data: {e}")
            except Exception as e:
                logger.error(f"Unexpected error in fetch_fires: {e}")
                
            if attempt < max_retries - 1:
                time.sleep(5)
                continue
                
        return self.fires