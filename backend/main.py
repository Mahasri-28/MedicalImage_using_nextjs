# backend/main.py
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import shutil
import os
import uuid

from core.database import get_db, PredictionRecord, ReportRecord
from ml.classifier import MedicalCNN
from agent.workflow import AgenticReportGenerator

app = FastAPI(title="Medical Agent API")

# Allow Next.js frontend to communicate with FastAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this to allow all origins temporarily
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("storage", exist_ok=True)

cnn_model = MedicalCNN() # Will load default ResNet50
agent = AgenticReportGenerator()

class ReportModel(BaseModel):
    explanation: str
    limitations: str

class AnalysisResponse(BaseModel):
    analysis_id: str
    prediction: str
    confidence: float
    report: ReportModel

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Save Image
    file_id = str(uuid.uuid4())
    file_path = f"storage/{file_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. CNN Classification
    ml_result = cnn_model.predict(file_path)
    
    # 3. Agentic Workflow
    report_data = agent.generate_educational_report(
        prediction=ml_result["predicted_class"],
        confidence=ml_result["confidence"]
    )
    
    # 4. Save to Database
    db_pred = PredictionRecord(
        id=file_id, 
        file_name=file.filename, 
        predicted_class=ml_result["predicted_class"], 
        confidence=ml_result["confidence"]
    )
    db.add(db_pred)
    
    db_report = ReportRecord(
        prediction_id=file_id,
        explanation=report_data["explanation"],
        limitations=report_data["limitations"]
    )
    db.add(db_report)
    db.commit()
    
    return AnalysisResponse(
        analysis_id=file_id,
        prediction=ml_result["predicted_class"],
        confidence=ml_result["confidence"],
        report=report_data
    )