import time
import logging
from pymongo import MongoClient
from pymongo.errors import PyMongoError

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MongoDBClient:
    """Simple MongoDB client for writing documents"""
    
    def __init__(self, uri, db_name):
        self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[db_name]
    
    def write_to_collection(self, collection_name, data):
        """
        Inserts a document into the specified MongoDB collection.

        Args:
            collection_name (str): The name of the collection to write to.
            data (Dict[str, Any]): The data to insert as a document.
        """
        collection = self.db[collection_name]
        result = collection.insert_one(data)
        print(f"Inserted document with ID: {result.inserted_id}")