def make_fire_job(producer_service, topic: str, source):
    def job():
        try:
            new_items = source.fetch_new_data()
            if new_items:
                for item in new_items:
                    producer_service.send(topic, item)
                    print(f"Sent fires data: {item}")
            else:
                print("No new fires data.")
        except Exception as e:
            print(f"Error in fires job: {e}")

    return job
