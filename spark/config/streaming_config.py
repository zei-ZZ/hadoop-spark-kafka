import os

class StreamingConfig:
    """Configuration class for the streaming application"""
    
    def __init__(self):
        # Kafka configuration
        self.KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.EARTHQUAKE_TOPIC = os.getenv('EARTHQUAKE_TOPIC', 'earthquake-stream')
        self.FIRE_TOPIC = os.getenv('FIRE_TOPIC', 'fire-stream')
        
        # Storage configuration
        self.OUTPUT_MODE = os.getenv('OUTPUT_MODE', 'hbase_rest')  # Changed default to hbase_rest
        self.OUTPUT_PATH = os.getenv('OUTPUT_PATH', '/tmp/flowshield_output')
        self.HBASE_REST_URL = os.getenv('HBASE_REST_URL', 'http://localhost:8080')  # Updated default HBase URL
        
        # Processing configuration
        self.CHECKPOINT_DIR = os.getenv('CHECKPOINT_DIR', './spark_checkpoints')
        self.PROCESSING_TIME = os.getenv('PROCESSING_TIME', '60 seconds')
        self.WATERMARK_THRESHOLD = os.getenv('WATERMARK_THRESHOLD', '2 hours')
        self.BATCH_SIZE = int(os.getenv('BATCH_SIZE', '500'))
        self.MAX_RECORDS_PER_TRIGGER = int(os.getenv('MAX_RECORDS_PER_TRIGGER', '1000'))
        
        # Alert configuration
        self.SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
        self.ALERT_EMAIL = os.getenv('ALERT_EMAIL', 'your-email@gmail.com')  # Update this
        self.ALERT_EMAIL_PASSWORD = os.getenv('ALERT_EMAIL_PASSWORD', 'your-app-password')  # Update this
        self.ALERT_RECIPIENT = os.getenv('ALERT_RECIPIENT', 'recipient@example.com')  # Update this
        self.ALERT_WEBHOOK_URL = os.getenv('ALERT_WEBHOOK_URL', '')  # Update this if using webhooks
        
        # Alert thresholds - including low levels for testing
        self.earthquake_thresholds = {
            'Low': 2.0,      # Alert for earthquakes >= 2.0 (for testing)
            'Moderate': 4.0,  # Alert for earthquakes >= 4.0 (for testing)
            'High': 6.0,     # Alert for earthquakes >= 6.0
            'Extreme': 7.0   # Alert for earthquakes >= 7.0
        }
        self.fire_thresholds = {
            'Low': 1.0,      # Alert for fires with FRP >= 1.0 (for testing)
            'Moderate': 5.0,  # Alert for fires with FRP >= 5.0 (for testing)
            'High': 50.0,    # Alert for fires with FRP >= 50
            'Extreme': 100.0 # Alert for fires with FRP >= 100
        }
        
        # Reduced alert cooldown for testing (1 minute instead of 5)
        self.alert_cooldown = 60  # 1 minute
        self.last_alert_time = {}