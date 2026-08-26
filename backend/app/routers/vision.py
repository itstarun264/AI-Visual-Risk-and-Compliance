import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.database import get_db
from app.config import settings
from app.models import User, VisualDetection
from app.schemas import VisualDetectionOut
from app.security import get_current_user, log_activity
from app.ai import get_vision_model
from app.services import RiskIntelligenceEngine

router = APIRouter(prefix="/vision", tags=["Visual AI Inference"])

class AnalyzeRequest(BaseModel):
    image_path: str

@router.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate MIME types
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload JPG or PNG images."
        )

    # 10MB Limit check
    max_size = 10 * 1024 * 1024
    # Read a chunk to verify size
    contents = file.file.read(max_size + 1)
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit."
        )
    # Reset read pointer
    file.file.seek(0)

    # Generate unique name
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return relative URL path for the frontend
    return {
        "filename": unique_filename,
        "image_path": dest_path,
        "url": f"/api/v1/vision/files/{unique_filename}"
    }

@router.post("/analyze", response_model=List[VisualDetectionOut])
def analyze_image(
    req: AnalyzeRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not os.path.exists(req.image_path):
        raise HTTPException(status_code=400, detail="Image file not found on disk")

    # Read binary bytes
    with open(req.image_path, "rb") as image_file:
        img_bytes = image_file.read()

    # Get injected vision model and predict
    model = get_vision_model()
    detections = model.predict(img_bytes)

    # Clear previous detections for this user (to keep dashboard tidy for Milestone 1, or accumulate)
    # The prompt says: "The dashboard must load real data and detections are stored."
    # Let's save them and aggregate them.
    saved_detections = []
    for d in detections:
        det = VisualDetection(
            user_id=current_user.id,
            image_path=req.image_path,
            model_name=model.__class__.__name__,
            class_name=d["class_name"],
            confidence=d["confidence"],
            risk_level=d["risk_level"],
            bounding_box=d["bounding_box"]
        )
        db.add(det)
        saved_detections.append(det)

    db.commit()
    for det in saved_detections:
        db.refresh(det)

    # Sync overall risk scores
    RiskIntelligenceEngine.sync_risk_profile(db=db, user_id=current_user.id)

    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="RISK_ANALYSIS",
        endpoint="/api/v1/vision/analyze",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        status_code=200,
        metadata={
            "image_path": req.image_path,
            "detections_count": len(saved_detections),
            "model_name": model.__class__.__name__
        }
    )

    return saved_detections

@router.get("/detections", response_model=List[VisualDetectionOut])
def get_detections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(VisualDetection).filter(
        VisualDetection.user_id == current_user.id
    ).order_by(VisualDetection.timestamp.desc()).all()

# File server router to serve files back to the client
from fastapi.responses import FileResponse

@router.get("/files/{filename}", include_in_schema=False)
def serve_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
