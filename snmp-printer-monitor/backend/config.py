import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'snmp-printer-monitor-secret-key-change-in-production'
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # SNMP Configuration
    SNMP_TIMEOUT = int(os.environ.get('SNMP_TIMEOUT', '5'))
    SNMP_RETRIES = int(os.environ.get('SNMP_RETRIES', '3'))
    
    # Monitoring Configuration
    UPDATE_INTERVAL = int(os.environ.get('UPDATE_INTERVAL', '30'))  # seconds
    
    # Alert thresholds
    LOW_TONER_THRESHOLD = int(os.environ.get('LOW_TONER_THRESHOLD', '20'))  # percentage
    CRITICAL_TONER_THRESHOLD = int(os.environ.get('CRITICAL_TONER_THRESHOLD', '10'))  # percentage