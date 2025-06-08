from airflow import DAG
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator

from datetime import datetime, timedelta

default_args = {
    'owner': 'airflow',
    'retries': 1,
    'retry_delay': timedelta(minutes=1),
}

with DAG(
    dag_id='spark_batch_job',
    default_args=default_args,
    start_date=datetime(2024, 1, 1),
    schedule_interval='* * * * *',  # every minute
    catchup=False,
) as dag:

    submit_job = SparkSubmitOperator(
        task_id='submit_spark_batch',
        application='/opt/spark/test_batch_job.py',
        conf={'spark.master': 'spark://spark-master:7077'},
        application_args=[],
        verbose=True,
    )
