# Configuration settings for Resume Scanner
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
    
    # API Keys
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # LinkedIn API (Note: LinkedIn has restricted API access)
    LINKEDIN_EMAIL = os.environ.get('LINKEDIN_EMAIL')
    LINKEDIN_PASSWORD = os.environ.get('LINKEDIN_PASSWORD')
    
    # Database (if needed for future enhancements)
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///resume_scanner.db'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    
    # Analysis Settings
    MAX_SKILLS_TO_EXTRACT = 15
    MAX_JOB_RECOMMENDATIONS = 5
    MIN_JOB_MATCH_PERCENTAGE = 30
    
    # File Processing
    MAX_RESUME_PAGES = 5
    SUPPORTED_LANGUAGES = [
        'English', 'Spanish', 'French', 'German', 'Italian', 
        'Portuguese', 'Dutch', 'Russian', 'Chinese', 'Japanese'
    ]

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Enhanced security for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    WTF_CSRF_ENABLED = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])