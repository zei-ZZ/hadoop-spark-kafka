def make_earthquake_job(producer_service, topic: str, source):
    def job():
        try:
            new_items = source.fetch_new_data()
            if new_items:
                for item in new_items:
                    producer_service.send(topic, item)
                    print(f"Sent earthquake data: {item}")
            else:
                producer_service.send(topic, {"message": "No new earthquake data"})
                print("No new earthquake data.")
        except Exception as e:
            print(f"Error in earthquake job: {e}")

    return job
