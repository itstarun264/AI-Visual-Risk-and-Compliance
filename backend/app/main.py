import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
import os

from app.config import settings
from app.database import engine, Base, get_db, fallback_mode
from app.routers import auth, profile, financial, study, habits, risk, compliance, vision, alerts, audit, dashboard, forecast

# Auto-create tables on startup (makes development and docker startup robust)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Visual Risk & Compliance Intelligence API",
    description="Backend API for Milestone 1: Data Collection & Profiling",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve uploaded media
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
# App routing structure
api_prefix = "/api/v1"

app.include_router(auth.router, prefix=api_prefix)
app.include_router(profile.router, prefix=api_prefix)
app.include_router(financial.router, prefix=api_prefix)
app.include_router(study.router, prefix=api_prefix)
app.include_router(habits.router, prefix=api_prefix)
app.include_router(risk.router, prefix=api_prefix)
app.include_router(compliance.router, prefix=api_prefix)
app.include_router(vision.router, prefix=api_prefix)
app.include_router(alerts.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(forecast.router, prefix=api_prefix)

@app.get("/api/v1/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Check connection
        db.execute(text("SELECT 1"))
        db_status = "SQLite Active" if fallback_mode else "PostgreSQL Active"
        return {
            "status": "healthy",
            "database": db_status,
            "tables": [
                "users",
                "user_profiles",
                "financial_records",
                "study_records",
                "habit_records",
                "risk_profiles",
                "visual_detections",
                "alerts",
                "user_activity_history",
                "compliance_records",
                "goals"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )

@app.get("/")
def read_root():
    return {"message": "AI Visual Risk & Compliance Intelligence API is running. Go to /docs for Swagger."}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
