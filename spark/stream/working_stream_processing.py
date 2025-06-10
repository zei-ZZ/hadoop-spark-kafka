from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import col, from_json, to_timestamp, window, udf, when, lit, current_timestamp, trim, split
from pyspark.sql.types import StructType, StringType, DoubleType, StructField
import random

def generate_random_coords():
    # Global latitude range: -90 to 90
    latitude = random.uniform(-90.0, 90.0)
    # Global longitude range: -180 to 180
    longitude = random.uniform(-180.0, 180.0)
    return {"latitude": latitude, "longitude": longitude}

earthquake_schema = StructType([
    StructField("id", StringType(), nullable=False),
    StructField("time", StringType(), nullable=False),  # ideally TimestampType with proper format
    StructField("magnitude", DoubleType(), nullable=True),
    StructField("place", StringType(), nullable=True),
    StructField("url", StringType(), nullable=True),
    StructField("type", StringType(), nullable=True),
    StructField("status", StringType(), nullable=True),
    StructField("magType", StringType(), nullable=True),
])

geo_schema = StructType([
    StructField("latitude", DoubleType(), True),
    StructField("longitude", DoubleType(), True)
])

@udf(returnType=geo_schema)
def random_coords_udf():
    return generate_random_coords()


def parse_stream(stream: DataFrame) -> DataFrame:
    """Parse raw Kafka JSON stream with schema and add debug timestamps."""

    # Filter out malformed records without id
    parsed = stream.filter(col("id").isNotNull())
    # Filter out seen earthquakes
    parsed 
    # Add a processing timestamp for debugging
    parsed = parsed.withColumn("processed_time", current_timestamp())
    parsed= parsed.withWatermark("event_time", "2 hours") \
        .dropDuplicates(["id"])
    return parsed

def extract_location(parsed: DataFrame) -> DataFrame:
    """Extract city and country from place string."""
    # Place often looks like: "6 km WSW of Anza, CA"
    # Simplify extraction: city = part before last comma, country = part after last comma
    # If no comma, city=place, country=Unknown

    city_country = parsed.withColumn(
        "city",
        when(col("place").contains(","), trim(split(col("place"), ",").getItem(0)))
        .otherwise(col("place"))
    ).withColumn(
        "country",
        when(col("place").contains(","), trim(split(col("place"), ",").getItem(1)))
        .otherwise(lit("Unknown"))
    )
    return city_country

def add_severity(df: DataFrame) -> DataFrame:
    """Add severity classification based on magnitude."""
    severity_col = when(col("magnitude") < 4.0, "Low") \
        .when(col("magnitude") < 6.0, "Moderate") \
        .when(col("magnitude") < 7.0, "High") \
        .otherwise("Extreme")

    return df.withColumn("severity", severity_col)


def process_earthquake_stream(stream: DataFrame) -> DataFrame:
    """Full processing pipeline for earthquake stream."""
    parsed = parse_stream(stream)
    parsed = extract_location(parsed)
    parsed = add_severity(parsed)

    return parsed

# Initialize Spark
spark = SparkSession.builder \
    .appName("EarthquakeStreamProcessor") \
    .config("spark.mongodb.write.connection.uri", "mongodb+srv://zied58:0000@batchresults.5qdkpvu.mongodb.net/") \
    .config("spark.mongodb.write.database", "disasterDB") \
    .config("spark.mongodb.write.convertJson", "any") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")
schema = StructType() \
    .add("id", StringType()) \
    .add("time", StringType()) \
    .add("magnitude", DoubleType()) \
    .add("place", StringType()) \
    .add("url", StringType()) \
    .add("type", StringType()) \
    .add("status", StringType()) \
    .add("magType", StringType())
# Read from Kafka
df_raw = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "earthquake-stream") \
    .option("startingOffsets", "latest")\
    .load()

df = df_raw.selectExpr("CAST(value AS STRING)") \
    .select(from_json(col("value"), schema).alias("data")) \
    .select("data.*") \
    .withColumn("event_time", to_timestamp("time"))

# Write raw to MongoDB
df.writeStream \
    .foreachBatch(lambda df, _: df.write.format("mongodb") \
    .option("collection", "earthquake-fire-raw") \
    .mode("append").save()) \
    .start()

# Process stream
df_with_coords = df.withColumn("coords", random_coords_udf())
df_with_coords = df_with_coords \
    .withColumn("latitude", col("coords.latitude")) \
    .withColumn("longitude", col("coords.longitude")) \
    .drop("coords")

processed_stream = process_earthquake_stream(df_with_coords)
processed_stream.writeStream \
    .foreachBatch(lambda df, _: df.write.format("mongodb") \
    .option("collection","earthquake-processed" ) \
    .mode("append").save()) \
    .start()

# Real-Time Alerts
alerts = processed_stream.filter(col("magnitude") > 5)
alerts.writeStream \
    .foreachBatch(lambda df, _: df.write.format("mongodb") \
    .option("collection","earthquake-alerts" ) \
    .mode("append").save()) \
    .start()

# Rolling Aggregates
agg = processed_stream.groupBy(
    window(col("event_time"), "1 hour"),
    col("place")
).agg(
    {"magnitude": "avg", "*": "count"}
)
agg.writeStream \
    .outputMode("update") \
    .format("console") \
    .start()
agg.writeStream \
    .foreachBatch(lambda df, _: df.write.format("mongodb") \
    .option("collection","earthquake-rolling-aggregates" ) \
    .mode("append").save()) \
    .start()

# Geo-Fencing Alerts
# geo_alerts = df.filter(geo_alert_udf(col("place")))
# geo_alerts.writeStream \
#     .format("console") \
#     .outputMode("append") \
#     .start()

spark.streams.awaitAnyTermination()
