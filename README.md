# Overview

## Technologies used

- kafka
- spark
- hadoop
- airflow
- hbase

  Other technologies (i.e: zookeper, postgres) were used to be able to run the other services

  `Note: Kafka is in KRAft mode`

## How to run

### With airflow

```
    docker build -t airflow-park . -f Dockerfile.airflow
    docker compose -f .\docker-compose.airflow.yml run --rm airflow-init  -d
    docker compose -f .\docker-compose.airflow.yml up -d
```

### Without airflow

```
   docker compose run --rm airflow-init  -d
   docker compose up -d
```
### Start a stream spark job 
To not have problems with user-defined module i.e: `ModuleNotFoundError: No module named 'helpers'`:
```
  cd <job_path_folder>
  spark-submit --master spark://spark-master:7077 --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.0 <job_path_in_container>
  # Example
  cd /opt/spark
  spark-submit --master spark://spark-master:7077 --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.0 /opt/spark/stream/data_processor.py
```
