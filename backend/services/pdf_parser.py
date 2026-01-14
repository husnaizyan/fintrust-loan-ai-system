import pdfplumber
import re
import os

def extract_loan_data_from_pdf(pdf_path):
    
    print(f"Extracting data from: {pdf_path}")
    
    with pdfplumber.open(pdf_path) as pdf:
        # Extract text from first page
        text = pdf.pages[0].extract_text()
    
    print(f"Extracted text length: {len(text)} characters")
    
    # Parse the text using regex patterns
    data = {}
    
    # Define patterns to match the PDF format
    patterns = {
        'application_id': r'Application Reference:\s*(\S+)',
        'full_name': r'Full Name \(as per IC\):\s*(.+)',
        'ic_number': r'IC Number:\s*([\d-]+)',
        'gender': r'Gender:\s*(\w+)',
        'marital_status': r'Marital Status:\s*(\w+)',
        'dependents': r'Number of Dependents:\s*(\d+)',
        'education': r'Education Level:\s*(.+?)(?:\n|Employment)',
        'self_employed': r'Employment Status:\s*(.+?)(?:\n|Monthly)',
        'applicant_income': r'Monthly Income:\s*RM\s*([\d,]+)',
        'coapplicant_income': r'Co-applicant Income:\s*RM\s*([\d,]+)',
        'total_income': r'Total Household Income:\s*RM\s*([\d,]+)',
        'loan_amount': r'Loan Amount Requested:\s*RM\s*([\d,]+)',
        'loan_term': r'Loan Tenure:\s*(\d+)\s*months',
        'credit_history': r'Credit History Status:\s*(.+?)(?:\n|Property)',
        'property_area': r'Property Location Type:\s*(\w+)',
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            data[key] = value
            print(f"Found {key}: {value}")
        else:
            print(f"Missing {key}")
    
    # Convert to API format
    api_data = convert_to_api_format(data)
    
    return api_data, data.get('full_name', 'Unknown'), data.get('application_id', 'Unknown')

def convert_to_api_format(data):
    
    # Gender mapping
    gender = data.get('gender', 'Male')
    gender_value = 1.0 if gender.lower() == 'male' else 0.0
    
    # Marital status mapping
    marital = data.get('marital_status', 'Single')
    married_value = 1.0 if marital.lower() == 'married' else 0.0
    
    # Education mapping
    education = data.get('education', 'Graduate')
    education_value = 0.0 if 'graduate' in education.lower() and 'not' not in education.lower() else 1.0
    
    # Employment mapping
    employment = data.get('self_employed', 'Employed')
    self_employed_value = 0.0 if 'self' in employment.lower() else 1.0
    
    # Credit history mapping
    credit = data.get('credit_history', 'Good')
    credit_value = 1.0 if 'good' in credit.lower() else 0.0
    
    # Property area mapping
    property_area = data.get('property_area', 'Urban')
    area_map = {'urban': 0.0, 'semiurban': 1.0, 'rural': 2.0}
    property_value = area_map.get(property_area.lower(), 0.0)
    
    # Clean numeric values
    def clean_number(value, default=0.0):
        if isinstance(value, str):
            value = value.replace(',', '').replace('RM', '').replace('k', '').strip()
            try:
                return float(value)
            except:
                return default
        return float(value) if value else default
    
    # Get loan amount and convert to thousands if needed
    loan_amount_raw = clean_number(data.get('loan_amount', 0))
    # If extracted as full amount (> 1000), convert to thousands
    loan_amount = loan_amount_raw / 1000 if loan_amount_raw > 1000 else loan_amount_raw
    
    api_data = {
        'Gender': gender_value,
        'Married': married_value,
        'Dependents': float(data.get('dependents', 0)),
        'Education': education_value,
        'Self_Employed': self_employed_value,
        'ApplicantIncome': clean_number(data.get('applicant_income', 0)),
        'CoapplicantIncome': clean_number(data.get('coapplicant_income', 0)),
        'LoanAmount': loan_amount,  
        'Loan_Amount_Term': float(data.get('loan_term', 360)),
        'Credit_History': credit_value,
        'Property_Area': property_value
    }
    
    print(f"\n{'='*60}")
    print(f"DEBUG: Extracted Data from PDF:")
    print(f"{'='*60}")
    
    for key, value in api_data.items():
        print(f"  {key:20} = {value}")
    print(f"{'='*60}\n")
    
    return api_data

# Test function
if __name__ == "__main__":
    # Test with one of your generated PDFs
    test_pdf = "malaysian_pdfs/loan_app_MYS20241000.pdf"
    
    if os.path.exists(test_pdf):
        print(f"Testing PDF extraction on: {test_pdf}\n")
        api_data, name, app_id = extract_loan_data_from_pdf(test_pdf)
        
    else:
        print(f"Test PDF not found: {test_pdf}")
        print("Please run the PDF generation script first!")