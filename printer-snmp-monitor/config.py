"""
Configuration file for Printer SNMP Monitor
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # SNMP settings
    DEFAULT_SNMP_COMMUNITY = os.getenv('DEFAULT_SNMP_COMMUNITY', 'public')
    DEFAULT_SNMP_PORT = int(os.getenv('DEFAULT_SNMP_PORT', 161))
    SNMP_TIMEOUT = int(os.getenv('SNMP_TIMEOUT', 3))
    SNMP_RETRIES = int(os.getenv('SNMP_RETRIES', 1))
    
    # Monitoring settings
    MONITORING_INTERVAL = int(os.getenv('MONITORING_INTERVAL', 30))  # seconds
    MAX_PRINTERS = int(os.getenv('MAX_PRINTERS', 100))
    
    # Logging settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'printer_monitor.log')
    
    # WebSocket settings
    SOCKETIO_ASYNC_MODE = os.getenv('SOCKETIO_ASYNC_MODE', 'threading')
    
    # Security settings
    ENABLE_AUTH = os.getenv('ENABLE_AUTH', 'False').lower() == 'true'
    ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin')
    
    # Database settings (for future use)
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///printers.db')
    
    # Email notifications (for future use)
    ENABLE_EMAIL_NOTIFICATIONS = os.getenv('ENABLE_EMAIL_NOTIFICATIONS', 'False').lower() == 'true'
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    NOTIFICATION_EMAIL = os.getenv('NOTIFICATION_EMAIL', '')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    ENABLE_AUTH = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name=None):
    """Get configuration by name"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    return config.get(config_name, config['default'])