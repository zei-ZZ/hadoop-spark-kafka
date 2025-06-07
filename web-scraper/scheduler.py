from apscheduler.schedulers.background import BackgroundScheduler
import atexit


class SchedulerService:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        atexit.register(self.scheduler.shutdown)

    def add_job(self, func, interval_seconds: int):
        self.scheduler.add_job(func=func, trigger="interval", seconds=interval_seconds)
