from pyspark.sql import SparkSession

# Create a Spark session
spark = SparkSession.builder \
    .appName("KafkaRawConsumer") \
    .getOrCreate()

# Read raw Kafka stream (no schema)
df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "earthquake-stream") \
    .option("startingOffsets", "latest") \
    .load()

# Convert Kafka `value` to string (ignore key, headers, etc.)
messages = df.selectExpr("CAST(value AS STRING) as message")

# Print messages to console
query = messages.writeStream \
    .outputMode("append") \
    .format("console") \
    .option("truncate", "false") \
    .start()

query.awaitTermination()
