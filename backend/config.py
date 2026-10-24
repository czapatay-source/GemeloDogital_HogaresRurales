"""
Configuration settings for FastAPI, Database, Celery, and Object Storage.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Gemelo Digital de Hogares Rurales de Sudamérica"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://rural_user:rural_password@localhost:5432/rural_twin_db"
    
    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    
    # S3 / MinIO
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    AWS_ACCESS_KEY_ID: str = "minioadmin"
    AWS_SECRET_ACCESS_KEY: str = "minioadminpassword"
    S3_BUCKET_ARTIFACTS: str = "rural-twin-artifacts"
    
    # Security
    SECRET_KEY: str = "development-insecure-secret-key-change-in-production"
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
