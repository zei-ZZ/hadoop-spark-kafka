import logging

from pyspark import SparkConf, SparkContext
from pyspark.sql import SparkSession

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
conf = SparkConf()

sc= SparkContext(conf=conf)

spark= SparkSession .builder \
        .config(sc.getConf)\
        .appName('my-app-name') \
        .getOrCreate()
class MongoDBClient:
    """Simple MongoDB client for writing documents"""
        
    def __init__(self, db_name, collection_name, app_name="my-app", convert_json="any"):
        base_uri = "mongodb://mongo:27017/"
        conf = SparkConf()
        conf.setMaster("spark://spark-master:7077").setAppName("My app")

        conf.set("spark.mongodb.read.connection.uri", base_uri)
        conf.set("spark.mongodb.read.database", db_name)
        conf.set("spark.mongodb.read.collection", collection_name)
        conf.set("spark.mongodb.read.convertJson", convert_json)

        conf.set("spark.mongodb.write.connection.uri", base_uri)
        conf.set("spark.mongodb.write.database", db_name)
        conf.set("spark.mongodb.write.collection", collection_name)
        conf.set("spark.mongodb.write.convertJson", convert_json)
        sc= SparkContext(conf=conf)
        self.spark= SparkSession.builder \
            .config(sc.getConf)\
            .appName(app_name) \
            .getOrCreate()

    def get_spark_mongo(self):
        return self.spark