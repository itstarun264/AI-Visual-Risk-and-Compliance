from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
engine = None
fallback_mode = False

try:
    if "postgresql" in db_url:
        # Create engine with short timeout to detect offline DB quickly
        # We use standard connection arguments for psycopg
        temp_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        # Test connection
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
    else:
        engine = create_engine(db_url)
except Exception as e:
    fallback_mode = True
    print(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
    sqlite_url = "sqlite:///./risk_intelligence.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
