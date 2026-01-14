from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import shutil
import sys
import os
import joblib
import uuid
import uvicorn
from dotenv import load_dotenv
from datetime import datetime

current_file = os.path.abspath(__file__)
api_dir = os.path.dirname(current_file)
backend_dir = os.path.dirname(api_dir)
project_root = os.path.dirname(backend_dir)

# Add backend to path so we can import services
sys.path.insert(0, backend_dir)
sys.path.insert(0, project_root)

from services.llm_service import LoanExplainerService
from services.pdf_parser import extract_loan_data_from_pdf
from services.signature_detector import detect_signature_in_pdf

load_dotenv()

app = FastAPI(title="Loan Officer Decision Support System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LoanExplainerService()

# Load ML model and scaler with proper paths
def load_model():
    model_path = os.path.join(backend_dir, 'ml_models', 'loan_status_predictor.pkl')
    print(f"Loading model from: {model_path}")
    
    if not os.path.exists(model_path):
        model_path = os.path.join(backend_dir, 'loan_status_predictor.pkl')
        print(f"Trying alternative: {model_path}")
    
    if os.path.exists(model_path):
        print(f"Model found at: {model_path}")
        return joblib.load(model_path)
    else:
        raise FileNotFoundError(f"Model not found at {model_path}")

def load_scaler():
    scaler_path = os.path.join(backend_dir, 'ml_models', 'vector.pkl')
    print(f"Loading scaler from: {scaler_path}")
    
    if not os.path.exists(scaler_path):
        scaler_path = os.path.join(backend_dir, 'vector.pkl')
        print(f"Trying alternative: {scaler_path}")
    
    if os.path.exists(scaler_path):
        print(f"Scaler found at: {scaler_path}")
        return joblib.load(scaler_path)
    else:
        raise FileNotFoundError(f"Scaler not found at {scaler_path}")

# Load model and scaler
model = load_model()
scaler = load_scaler()

num_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term']

applications_db = {}

class LoanApproval(BaseModel):
    Gender: float
    Married: float
    Dependents: float
    Education: float
    Self_Employed: float
    ApplicantIncome: float
    CoapplicantIncome: float
    LoanAmount: float
    Loan_Amount_Term: float
    Credit_History: float
    Property_Area: float
    
class QuestionRequest(BaseModel):
    application_id: str
    question: str

class OfficerNote(BaseModel):
    application_id: str
    note: str
    officer_name: str

@app.post("/predict")
async def predict_loan_status(application: LoanApproval):
# Basic endpoint for ML prediction only
    
    try:
        input_data = pd.DataFrame([application.dict()])
        input_data[num_cols] = scaler.transform(input_data[num_cols])
        result = model.predict(input_data)

        if result[0] == 1:
            return {'Loan Status': "Approved"}
        else:
            return {'Loan Status': "Not Approved"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    
@app.post("/api/loan/evaluate")
async def evaluate_with_explanation(application: LoanApproval):
# Enhanced endpoint with ML prediction + LLM explanation
    
    try:
        # Get ML prediction
        input_data = pd.DataFrame([application.dict()])
        input_data[num_cols] = scaler.transform(input_data[num_cols])
        result = model.predict(input_data)
        
        prediction = "Approved" if result[0] == 1 else "Rejected"
    
        # Generate LLM explanation
        explanation_data = llm_service.generate_explanation(
            application.dict(),
            prediction
        )
        
        application_id = str(uuid.uuid4())
        applications_db[application_id] = {
            "data": application.dict(),
            "prediction": prediction,
            "explanation": explanation_data["explanation"],
            "metrics": explanation_data.get("metrics", {}),
            "status": "pending_review",
            "created_at": datetime.now().isoformat(),
            "officer_notes": []
        }
        
        return {
            "application_id": application_id,
            "decision": prediction,
            "explanation": explanation_data["explanation"],
            "metrics": explanation_data.get("metrics", {}),
            "application_data": application.dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
@app.post("/api/loan/ask")
async def ask_question(request: QuestionRequest):
# Endpoint for loan officer to ask questions about application
    
    try:
        # Retrieve application context (check both UUID and original ID)
        context = None
        if request.application_id in applications_db:
            context = applications_db[request.application_id]
        else:
            # Search by application ID
            for app_id, app_data in applications_db.items():
                if app_data.get('original_application_id') == request.application_id:
                    context = app_data
                    break
        
        if not context:
            raise HTTPException(status_code=404, detail="Application not found")
    
        # Generate answer using LLM
        answer = llm_service.answer_question(
            request.question,
            context
        )
        
        return {
            "question": request.question,
            "answer": answer
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
@app.get("/api/loan/status/{application_id}")
async def get_application_status(application_id: str):
# Endpoint to retrieve application details
    
    if application_id in applications_db:
        return applications_db[application_id]
    
    for app_id, app_data in applications_db.items():
        if app_data.get('original_application_id') == application_id:
            return app_data
    
    raise HTTPException(status_code=404, detail="Application not found")

@app.post("/api/loan/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
# Endpoint to upload and process loan application PDF
    
    print(f"\n{'='*70}")
    print(f" RECEIVED PDF UPLOAD: {file.filename}")
    print(f"{'='*70}")
    
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Create upload folder
        upload_folder = "uploads"
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            print(f"Created upload folder: {upload_folder}")
        
        # Save uploaded file
        file_path = os.path.join(upload_folder, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"Saved file to: {file_path}")
        
        # Step 1: Check for signature
        print(f"Step 1: Check signature")
        has_signature, sig_confidence = detect_signature_in_pdf(file_path)
        
        print(f"Signature Detection Results")
        print(f"Verified: {has_signature}")
        print(f"Confidence: {sig_confidence}")
        
        if not has_signature:
            print(f"No signature detected (confidence: {sig_confidence:.2f}%)")
            return {
                "application_id": "N/A",
                "applicant_name": "Unknown",
                "decision": "rejected",
                "signature_verified": False,
                "signature_confidence": sig_confidence,
                "income": 0,
                "loan_amount": 0,
                "explanation": "**Document Incomplete - Missing Signature**\n\nThe application cannot be processed because the document lacks a valid signature. Please request the applicant to sign and resubmit the application."
            }
        
        print(f"Signature detected (confidence: {sig_confidence:.2f}%)")
        
        # Step 2: Extract data from PDF
        print(f"Step 2: Extracting data from PDF")
        loan_data, applicant_name, application_id = extract_loan_data_from_pdf(file_path)
        print(f"Extracted data for: {applicant_name} (ID: {application_id})")
        
        # Step 3: Process with ML model
        print(f"Step3: Running ML prediction")
        input_data = pd.DataFrame([loan_data])
        
        # Scale the data
        input_data[num_cols] = scaler.transform(input_data[num_cols])
        
        # Get prediction
        result = model.predict(input_data)
        prediction = "Approved" if result[0] == 1 else "Rejected"
        
        print(f"ML Prediction: {prediction}")
        
        # Step 4: Generate LLM explanation
        print(f"Step 4: Generating risk assessment")
        explanation_data = llm_service.generate_explanation(loan_data, prediction)
        print(f"Generated assessment ({len(explanation_data['explanation'])} chars)")
        
        # Step 5: Store application
        application_uuid = str(uuid.uuid4())
        applications_db[application_uuid] = {
            "applicant_name": applicant_name,
            "original_application_id": application_id,
            "data": loan_data,
            "prediction": prediction,
            "explanation": explanation_data["explanation"],
            "metrics": explanation_data.get("metrics", {}),
            "has_signature": has_signature,
            "signature_confidence": sig_confidence,
            "filename": file.filename,
            "status": "pending_review",
            "created_at": datetime.now().isoformat(),
            "officer_notes": []
        }
        
        # Store by original application_id
        applications_db[application_id] = applications_db[application_uuid]
        
        print(f"Stored application: {application_uuid}")
        
        print(f"\n{'='*70}")
        print(f"Passed! Application processed: {prediction}")
        print(f"{'='*70}\n")
        
        return {
            "application_id": application_id,
            "applicant_name": applicant_name,
            "decision": prediction.lower(),
            "signature_verified": has_signature,
            "signature_confidence": sig_confidence,
            "income": loan_data.get('ApplicantIncome', 0),
            "loan_amount": loan_data.get('LoanAmount', 0) * 1000,
            "explanation": explanation_data["explanation"],
            "metrics": explanation_data.get("metrics", {})
        }
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/api/loan/add-note")
async def add_officer_note(note_request: OfficerNote):
# Add officer notes to an application
    
    try:
        # Find application
        app_data = None
        if note_request.application_id in applications_db:
            app_data = applications_db[note_request.application_id]
        else:
            # Search by original ID
            for app_id, data in applications_db.items():
                if data.get('original_application_id') == note_request.application_id:
                    app_data = data
                    break
        
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Add note
        new_note = {
            "note": note_request.note,
            "officer": note_request.officer_name,
            "timestamp": datetime.now().isoformat()
        }
        
        if "officer_notes" not in app_data:
            app_data["officer_notes"] = []
        
        app_data["officer_notes"].append(new_note)
        
        return {
            "success": True,
            "message": "Note added successfully",
            "note": new_note
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding note: {str(e)}")

@app.post("/api/loan/alternative-terms/{application_id}")
async def get_alternative_terms(application_id: str):
# Get alternative loan terms for rejected applications
    
    try:
        
        app_data = None
        if application_id in applications_db:
            app_data = applications_db[application_id]
        else:
            for app_id, data in applications_db.items():
                if data.get('original_application_id') == application_id:
                    app_data = data
                    break
        
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Generate alternative suggestions
        suggestions = llm_service.suggest_alternative_terms(
            app_data['data'],
            app_data['prediction']
        )
        
        return {
            "application_id": application_id,
            "original_decision": app_data['prediction'],
            "alternative_terms": suggestions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating alternatives: {str(e)}")

@app.get("/api/analytics/summary")
async def get_analytics_summary():
# Analytics summary for dashboard
    
    try:
        total_apps = len([app for app in applications_db.values() if 'prediction' in app])
        
        if total_apps == 0:
            return {
                "total_applications": 0,
                "approval_rate": 0.0,
                "rejection_rate": 0.0,
                "average_income": 0.0,
                "average_loan_amount": 0.0,
                "pending_review": 0
            }
        
        approved = len([app for app in applications_db.values() if app.get('prediction') == 'Approved'])
        rejected = len([app for app in applications_db.values() if app.get('prediction') == 'Rejected'])
        pending = len([app for app in applications_db.values() if app.get('status') == 'pending_review'])
        
        incomes = [app['data'].get('ApplicantIncome', 0) for app in applications_db.values() if 'data' in app]
        loan_amounts = [app['data'].get('LoanAmount', 0) * 1000 for app in applications_db.values() if 'data' in app]
        
        return {
            "total_applications": total_apps,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": round((approved / total_apps * 100), 2) if total_apps > 0 else 0,
            "rejection_rate": round((rejected / total_apps * 100), 2) if total_apps > 0 else 0,
            "average_income": round(sum(incomes) / len(incomes), 2) if incomes else 0,
            "average_loan_amount": round(sum(loan_amounts) / len(loan_amounts), 2) if loan_amounts else 0,
            "pending_review": pending
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@app.post("/api/loan/upload-bulk")
async def upload_bulk_pdfs(files: List[UploadFile] = File(...)):
# Bulk upload and process multiple loan application PDFs (max50)
    
    print(f"\n{'='*70}")
    print(f"RECEIVED BULK UPLOAD: {len(files)} files")
    print(f"{'='*70}")
    
    results = []
    upload_folder = "uploads"
    
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    for file in files:
        try:
            # Validate file type
            if not file.filename.endswith('.pdf'):
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": "Only PDF files are allowed"
                })
                continue
            
            # Save uploaded file
            file_path = os.path.join(upload_folder, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            print(f"\n📄 Processing: {file.filename}")
            
            # Check signature
            has_signature, sig_confidence = detect_signature_in_pdf(file_path)
            
            if not has_signature:
                results.append({
                    "filename": file.filename,
                    "status": "incomplete",
                    "message": "Missing signature",
                    "signature_confidence": sig_confidence
                })
                continue
            
            # Extract data
            loan_data, applicant_name, application_id = extract_loan_data_from_pdf(file_path)
            
            # ML prediction
            input_data = pd.DataFrame([loan_data])
            input_data[num_cols] = scaler.transform(input_data[num_cols])
            result = model.predict(input_data)
            prediction = "Approved" if result[0] == 1 else "Rejected"
            
            # Generate explanation
            explanation_data = llm_service.generate_explanation(loan_data, prediction)
            
            # Store application
            application_uuid = str(uuid.uuid4())
            applications_db[application_uuid] = {
                "applicant_name": applicant_name,
                "original_application_id": application_id,
                "data": loan_data,
                "prediction": prediction,
                "explanation": explanation_data["explanation"],
                "metrics": explanation_data.get("metrics", {}),
                "has_signature": has_signature,
                "signature_confidence": sig_confidence,
                "filename": file.filename,
                "status": "pending_review",
                "created_at": datetime.now().isoformat(),
                "officer_notes": []
            }
            
            applications_db[application_id] = applications_db[application_uuid]
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "application_id": application_id,
                "applicant_name": applicant_name,
                "decision": prediction.lower(),
                "income": loan_data.get('ApplicantIncome', 0),
                "loan_amount": loan_data.get('LoanAmount', 0) * 1000,
                "signature_confidence": sig_confidence
            })
            
            print(f"{file.filename}: {prediction}")
            
        except Exception as e:
            print(f"Error processing {file.filename}: {str(e)}")
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })
    
    # Summary
    successful = len([r for r in results if r['status'] == 'success'])
    approved = len([r for r in results if r.get('decision') == 'approved'])
    rejected = len([r for r in results if r.get('decision') == 'rejected'])
    
    print(f"\n{'='*70}")
    print(f"BULK PROCESSING COMPLETE")
    print(f"   Total: {len(files)} | Success: {successful} | Approved: {approved} | Rejected: {rejected}")
    print(f"{'='*70}\n")
    
    return {
        "total_files": len(files),
        "successful": successful,
        "failed": len(files) - successful,
        "approved": approved,
        "rejected": rejected,
        "results": results
    }

@app.get("/api/applications/list")
async def list_applications(status: Optional[str] = None, limit: int = 50):
# List all applications with optional filtering
    
    try:
        apps_list = []
        
        for app_id, app_data in applications_db.items():
            if 'prediction' not in app_data:
                continue
            
            if len(app_id) > 20:
                continue
            
            if status and app_data.get('prediction', '').lower() != status.lower():
                continue
            
            apps_list.append({
                "application_id": app_data.get('original_application_id', app_id),
                "applicant_name": app_data.get('applicant_name', 'Unknown'),
                "decision": app_data.get('prediction', 'Unknown'),
                "income": app_data.get('data', {}).get('ApplicantIncome', 0),
                "loan_amount": app_data.get('data', {}).get('LoanAmount', 0) * 1000,
                "created_at": app_data.get('created_at', ''),
                "status": app_data.get('status', 'pending_review'),
                "signature_confidence": app_data.get('signature_confidence', 0)
            })
        
        # Sort by created_at
        apps_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            "applications": apps_list[:limit],
            "total": len(apps_list)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing applications: {str(e)}")

if __name__ == "__main__":

    print("Starting server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
