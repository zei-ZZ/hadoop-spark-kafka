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
