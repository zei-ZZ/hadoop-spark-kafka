import base64
import time
import requests 
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class HBaseRestClient:
    """Simple HBase REST API client"""
    
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        
    def write_row(self, table_name, row_key, data):
        """Write a single row to HBase via REST API"""
        try:
            url = f"{self.base_url}/{table_name}/{row_key}"
            
            # Convert data to HBase REST format
            cells = []
            for key, value in data.items():
                if value is not None:
                    cells.append({
                        "column": base64.b64encode(f"info:{key}".encode()).decode(),
                        "timestamp": int(time.time() * 1000),
                        "$": base64.b64encode(str(value).encode()).decode()
                    })
            
            payload = {
                "Row": [{
                    "key": base64.b64encode(row_key.encode()).decode(),
                    "Cell": cells
                }]
            }
            
            response = requests.post(
                url, 
                json=payload, 
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            return response.status_code in [200, 201]
            
        except Exception as e:
            logger.error(f"Failed to write to HBase REST: {str(e)}")
            return False
