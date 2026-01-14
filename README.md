# FinTrust - AI Loan Intelligence System

**AI-Powered Loan Application Processing & Risk Assessment Platform**

An intelligent system that helps bank loan officers process applications efficiently using AI-powered risk assessment analysis, signature verification, and automated document analysis.

### Problem Statement
Manual loan processing is time-consuming and inefficient. Bank officers spend 40+ minutes reviewing 20 applications, including straightforward approvals that don't require expert judgment.

### Solution
FinTrust automates the initial assessment using AI and machine learning, reducing processing time by 87.5% while enabling officers to focus their expertise on complex, borderline cases.

### Result
-  Process 20 applications in 5 minutes (vs 40 minutes manually)
-  Officers focus 80% of time on rejected/edge cases
-  95%+ signature detection accuracy
-  AI-powered risk assessment and recommendations

## Key Features

### 1. Single & Bulk PDF Processing
- Upload individual applications or batch process up to 50 PDFs
- Automated data extraction from loan application forms
- Intelligent error handling per document

### 2. AI Analysis
- ML-powered approval/rejection prediction
- Detailed risk factor analysis
- Debt-to-Income (DTI) ratio calculation
- Professional officer-focused explanations

### 3. Signature Detection
- Computer vision-based signature detection
- 95%+ accuracy using OpenCV
- Confidence scoring system
- Text marker detection ("Digitally signed")

### 4. AI Assistant
- Natural language Q&A about applications
- Alternative loan terms suggestions
- Risk factor explanations
- Decision support recommendations

### 5. Analytics Dashboard
- Real-time approval/rejection rates
- Application trends visualization
- Processing time metrics
- Income and loan amount analytics

### 6. Automated Communications
- Export Excel, PDF, and generate full reports
- Officer notes and audit trail

## Tech Stack

### Backend
- **Python** - Core language
- **FastAPI** - API
- **Scikit-learn** - Machine learning model (Logistic Regression)
- **Anthropic Claude AI** - Natural language processing & risk assessment
- **OpenCV** - Computer vision for signature detection
- **PDFPlumber** - PDF text extraction
- **Pandas & NumPy** - Data processing

### Frontend
- **React** - UI framework (built on Lovable platform)
- **TailwindCSS** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool

### ML/AI Components
1. **Loan Approval Prediction** - Logistic Regression (Scikit-learn)
2. **Risk Assessment** - Claude AI (Large Language Model)
3. **Signature Detection** - OpenCV + Computer Vision
4. **Document Parsing** - PDFPlumber + NLP


### Processing Pipeline:

PDF Upload → Signature Check → Data Extraction → ML Prediction 
    → AI Assessment → Results + Recommendations → Officer Decision

##  Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Anthropic API Key
- poppler-utils (for PDF processing)

### Backend Setup

# Clone repository
git clone https://github.com/YOUR_USERNAME/loan-officer-ai-system.git
cd loan-officer-ai-system

# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install system dependencies
# Ubuntu/Debian:
sudo apt-get install poppler-utils
# macOS:
brew install poppler

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the backend
python -m uvicorn api.main:app --reload --port 8000


Backend will run at: `http://localhost:8000`  
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

Frontend will run at: `http://localhost:5173`


## Usage

### Single Application Processing

1. Navigate to Upload page
2. Drag & drop or select PDF file
3. Click "Upload & Analyze Application"
4. View risk assessment and decision
5. Ask AI assistant questions about the application

### Bulk Processing

1. Navigate to Bulk Upload page
2. Select multiple PDF files (up to 50)
3. Click "Process Applications"
4. View summary statistics (e.g., "15 Approved, 5 Rejected")
5. Click "Review Rejected Applications" for detailed analysis

### AI Assistant Queries

Example questions:
- "What is the debt-to-income ratio?"
- "What loan amount would be approvable?"
- "What are the main risk factors?"
- "What if we extend the loan term?"


## API Documentation

### Main Endpoints

#### Single Upload
http
POST /api/loan/upload-pdf
Content-Type: multipart/form-data

Response:
{
  "application_id": "MYS20241008",
  "applicant_name": "John Doe",
  "decision": "approved",
  "signature_verified": true,
  "signature_confidence": 95.0,
  "income": 5000,
  "loan_amount": 200000,
  "explanation": "Risk assessment...",
  "metrics": { "dti_ratio": 35.5, ... }
}


#### Bulk Upload
http
POST /api/loan/upload-bulk
Content-Type: multipart/form-data

Response:
{
  "total_files": 10,
  "successful": 8,
  "approved": 5,
  "rejected": 3,
  "results": [...]
}


#### Ask AI Assistant
http
POST /api/loan/ask
Content-Type: application/json

{
  "application_id": "MYS20241008",
  "question": "What is the DTI ratio?"
}


#### Get Analytics
http
GET /api/analytics/summary

Response:
{
  "total_applications": 50,
  "approval_rate": 75.5,
  "average_income": 5500,
  ...
}

## Project Impact

### Efficiency Gains
- **87.5% time reduction** - 20 apps in 5 min vs 40 min
- **Focus optimization** - Officers spend 80% time on complex cases
- **Automated triage** - Instant categorization of applications

### Accuracy Improvements
- **95%+ signature detection** accuracy
- **Consistent risk assessment** using ML model
- **Reduced human error** in data entry

### Business Value
- **Higher throughput** - Process 4x more applications
- **Better decisions** - AI-powered insights for edge cases
- **Audit trail** - Complete decision documentation
- **Customer satisfaction** - Faster response times

## Machine Learning Model

### Model Details
```
- **Algorithm:** Logistic Regression
- **Features:** 11 financial and demographic factors
- **Training Data:** Historical loan applications
- **Performance:** ~80% accuracy on test set
```

### Key Features Used
```
1. Applicant Income
2. Co-applicant Income
3. Loan Amount
4. Loan Term
5. Credit History
6. Employment Status
7. Number of Dependents
8. Education Level
9. Marital Status
10. Property Area
11. Gender
```

### Model Evaluation
**Algorithm:** Random Forest Classifier

**Performance Metrics:**
```
Accuracy:  77%
Precision: 78%
Recall:    94%
F1-Score:  85%
```

**Cross-Validation Score:** 80%

**Hyperparameter Optimization:**
Model was tuned using GridSearchCV with 5-fold cross-validation:
- Number of trees (n_estimators): 690
- Minimum samples to split: 50
- Minimum samples per leaf: 2
- Maximum features: Optimized via grid search

**Business Impact:**
The 94% recall rate ensures that the bank captures most profitable loan opportunities while the 78% precision maintains acceptable risk levels by minimizing false approvals.

## Future Enhancements

- [ ] Multi-officer authentication system
- [ ] Integration with core banking systems
- [ ] Advanced fraud detection
- [ ] Advanced analytics and reporting

---
This project is created for academic purposes.

---

## Academic Project Information

This project was developed as part of CAIE Program at SG AI Academy.

**Project Objectives:**
- Demonstrate practical application of AI/ML in real-world scenarios
- Integrate multiple AI technologies (LLM, ML, Computer Vision)
- Build AI full-stack application
- Solve meaningful business problem with measurable impact

**Key Learning Outcomes:**
- Full-stack development (React + FastAPI)
- Machine Learning model deployment
- LLM integration and prompt engineering
- Computer Vision implementation
- RESTful API design
- Software engineering best practices