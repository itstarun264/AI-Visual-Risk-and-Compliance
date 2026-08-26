import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+psycopg://postgres:postgres@localhost:5432/risk_intelligence")
    JWT_SECRET_KEY: str = Field(default="4eb80a3c200bc7a1aefd60064f26b567b57bfbbcf8c991823793f0b2fca73138")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440)
    UPLOAD_DIR: str = Field(default="uploads")
    AI_MODEL_PATH: str = Field(default="models/model.pt")
    PORT: int = Field(default=8000)

    # Look for .env file in parent directories
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
