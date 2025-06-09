from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from functools import lru_cache
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class GeoCoder:
    """Geocoding utility class with caching"""
    
    def __init__(self):
        # self.geolocator = Nominatim(user_agent="flowshield")
        self.cache = {}
    
    @lru_cache(maxsize=1000)
    def get_location_info(self, lat: float, lon: float) -> tuple:
        """Get city and country from coordinates with caching"""
        # try:
        #     location = self.geolocator.reverse(f"{lat}, {lon}", language='en')
        #     if location:
        #         address = location.raw.get('address', {})
        #         city = address.get('city') or address.get('town') or address.get('village') or "Unknown"
        #         country = address.get('country') or "Unknown"
        #         return city, country
        # except (GeocoderTimedOut, GeocoderServiceError) as e:
        #     logger.warning(f"Geocoding failed for coordinates ({lat}, {lon}): {str(e)}")
        return "Unknown", "Unknown"
    
