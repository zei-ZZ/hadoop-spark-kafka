import os
import time

class AlertManager:
    """Manages alerting functionality for events"""
    
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.alert_email = os.getenv('ALERT_EMAIL')
        self.alert_email_password = os.getenv('ALERT_EMAIL_PASSWORD')
        self.alert_recipient = os.getenv('ALERT_RECIPIENT')
        self.webhook_url = os.getenv('ALERT_WEBHOOK_URL')
        
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
    
    def should_alert(self, event_type: str, severity: str, value: float) -> bool:
        """Determine if an alert should be sent based on severity and cooldown"""
        current_time = time.time()
        alert_key = f"{event_type}_{severity}"
        
        # Check if we're past the cooldown period
        if alert_key in self.last_alert_time:
            if current_time - self.last_alert_time[alert_key] < self.alert_cooldown:
                return False
        
        # Check if the event exceeds the threshold
        if event_type == 'earthquake':
            threshold = self.earthquake_thresholds.get(severity)
            if threshold and value >= threshold:
                self.last_alert_time[alert_key] = current_time
                return True
        elif event_type == 'fire':
            threshold = self.fire_thresholds.get(severity)
            if threshold and value >= threshold:
                self.last_alert_time[alert_key] = current_time
                return True
        
        return False