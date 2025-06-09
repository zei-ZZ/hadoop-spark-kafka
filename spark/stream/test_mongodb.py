from pyspark import SparkConf, SparkContext
from pyspark.sql import SparkSession


# org.mongodb.spark:mongo-spark-connector_2.12:10.5.0
conf = SparkConf()
conf.setMaster("spark://spark-master:7077").setAppName("My app")

conf.set("spark.mongodb.read.connection.uri", "mongodb://mongo:27017/")
conf.set("spark.mongodb.read.database", "test")
conf.set("spark.mongodb.read.collection", "employees")
conf.set("spark.mongodb.read.convertJson", "any")

conf.set("spark.mongodb.write.connection.uri", "mongodb://mongo:27017/")
conf.set("spark.mongodb.write.database", "test")
conf.set("spark.mongodb.write.collection", "employees")
conf.set("spark.mongodb.write.convertJson", "any")

sc= SparkContext(conf=conf)

spark= SparkSession .builder \
        .config(sc.getConf)\
        .appName('my-app-name') \
        .getOrCreate()


data = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35}
]

df = spark.createDataFrame(data)

df.write.format("mongodb").mode("append").save()

spark.stop()
