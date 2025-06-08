from pyspark.sql import SparkSession

if __name__ == "__main__":
    spark = SparkSession.builder.appName("TestBatchJob").getOrCreate()

    data = [("Alice", 30), ("Bob", 25), ("Charlie", 35)]
    df = spark.createDataFrame(data, ["name", "age"])
    df.printSchema()
    df.show()

    spark.stop()
