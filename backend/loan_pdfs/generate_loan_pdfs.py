import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from faker import Faker
from PIL import Image, ImageDraw, ImageFont
import random
import os
from datetime import datetime, timedelta

fake = Faker()
# No option to generate random data for Malaysia using Faker, only countries from US/Indonesia etc.
# Create own functions for Malaysian data
# Faker used to create fake dates only

# Malaysian-specific data
MALAYSIAN_STATES = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
    'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
]

MALAYSIAN_CITIES = {
    'Urban': ['Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Johor Bahru', 'George Town', 'Ipoh', 'Subang Jaya'],
    'Semiurban': ['Seremban', 'Melaka City', 'Kuantan', 'Kota Bharu', 'Alor Setar', 'Kuala Terengganu'],
    'Rural': ['Bentong', 'Raub', 'Kuala Lipis', 'Mersing', 'Baling', 'Jelebu', 'Kuala Kangsar']
}

# Malaysian names by ethnicity
MALAY_MALE_FIRST = ['Ahmad', 'Muhammad', 'Ali', 'Hassan', 'Abdullah', 'Ibrahim', 'Ismail', 'Omar', 'Yusof', 'Aziz']
MALAY_FEMALE_FIRST = ['Siti', 'Nur', 'Fatimah', 'Aminah', 'Zainab', 'Khadijah', 'Mariam', 'Aisyah', 'Halimah', 'Sofiah']
MALAY_LAST = ['Abdullah', 'Rahman', 'Hassan', 'Ahmad', 'Ibrahim', 'Ismail', 'Ali', 'Mohd', 'Osman', 'Yusof']

CHINESE_SURNAMES = ['Tan', 'Lee', 'Wong', 'Lim', 'Ng', 'Chan', 'Ong', 'Teo', 'Goh', 'Koh', 'Chong', 'Chua']
CHINESE_GIVEN = ['Wei', 'Ming', 'Hui', 'Ling', 'Chen', 'Siew', 'Peng', 'Yong', 'Kim', 'Hock', 'Seng', 'Choon']

INDIAN_FIRST = ['Raj', 'Kumar', 'Ravi', 'Sanjay', 'Devi', 'Priya', 'Kavitha', 'Lakshmi', 'Siva', 'Murugan']
INDIAN_LAST = ['Kumar', 'Raj', 'Singh', 'Krishnan', 'Narayanan', 'Pillai', 'Nair', 'Reddy', 'Naidu', 'Gopal']

STREET_TYPES = ['Jalan', 'Lorong', 'Jalan Raja', 'Jalan Tun', 'Jalan Sultan', 'Persiaran']
STREET_NAMES = ['Merdeka', 'Raja Chulan', 'Ampang', 'Bukit Bintang', 'Tun Razak', 'Damansara', 
                'Bangsar', 'Cheras', 'Sentul', 'Kepong', 'Klang', 'Petaling']

def generate_malaysian_ic():
    # Generate realistic Malaysian IC number 
    years_ago = random.randint(18, 65)
    birth_date = datetime.now() - timedelta(days=years_ago*365 + random.randint(0, 364))
    date_part = birth_date.strftime('%y%m%d')
    state_code = f"{random.randint(1, 16):02d}"
    random_part = f"{random.randint(0, 9999):04d}"
    return f"{date_part}-{state_code}-{random_part}"

def generate_malaysian_phone():
    # Generate Malaysian mobile number
    prefixes = ['010', '011', '012', '013', '014', '016', '017', '018', '019']
    prefix = random.choice(prefixes)
    first_part = ''.join([str(random.randint(0, 9)) for _ in range(3)])
    second_part = ''.join([str(random.randint(0, 9)) for _ in range(4)])
    return f"+60{prefix[1:]}-{first_part}-{second_part}"

def generate_malaysian_name(gender):
    # Generate Malaysian name
    ethnicity = random.choice(['malay', 'chinese', 'indian'])
    
    if ethnicity == 'malay':
        if gender == 'Male':
            first = random.choice(MALAY_MALE_FIRST)
            connector = 'bin'
        else:
            first = random.choice(MALAY_FEMALE_FIRST)
            connector = 'binti'
        last = random.choice(MALAY_LAST)
        return f"{first} {connector} {last}"
    
    elif ethnicity == 'chinese':
        surname = random.choice(CHINESE_SURNAMES)
        given1 = random.choice(CHINESE_GIVEN)
        given2 = random.choice(CHINESE_GIVEN)
        return f"{surname} {given1} {given2}"
    
    else:  # indian
        first = random.choice(INDIAN_FIRST)
        last = random.choice(INDIAN_LAST)
        if gender == 'Male':
            middle = random.choice(['', 'a/l', ''])
        else:
            middle = random.choice(['', 'a/p', ''])
        
        if middle:
            return f"{first} {middle} {last}"
        else:
            return f"{first} {last}"

def generate_malaysian_address(area_type):
    # Generate Malaysian address
    city = random.choice(MALAYSIAN_CITIES[area_type])
    state = random.choice(MALAYSIAN_STATES)
    postcode = random.randint(10000, 99999)
    
    building = random.choice([
        f"No. {random.randint(1, 999)}",
        f"Lot {random.randint(1, 500)}",
        f"{random.randint(1, 50)}-{random.randint(1, 20)}"
    ])
    
    street_type = random.choice(STREET_TYPES)
    street_name = random.choice(STREET_NAMES)
    
    taman = random.choice([
        '', 
        f'Taman {random.choice(["Sri", "Bukit", "Bandar"])} {random.choice(["Indah", "Jaya", "Maju", "Sentosa"])}',
        ''
    ])
    
    if taman:
        return f"{building}, {street_type} {street_name}, {taman}, {postcode} {city}, {state}"
    else:
        return f"{building}, {street_type} {street_name}, {postcode} {city}, {state}"

def generate_malaysian_email(name):
    # Generate email from name
    clean_name = name.lower().replace(' bin ', '.').replace(' binti ', '.').replace(' a/l ', '.').replace(' a/p ', '.')
    clean_name = clean_name.replace(' ', '.').replace('/', '')
    domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    return f"{clean_name}{random.randint(1, 999)}@{random.choice(domains)}"

def generate_signature_image(name, output_path):
    # Generate a handwritten-style signature image
    # Create image with transparent background
    width, height = 400, 100
    image = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    
    try:
        font = ImageFont.truetype("DancingScript-Regular.ttf", 50)
    except:
        # Fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 40)
        except:
            font = ImageFont.load_default()
    
    # Signature color (dark blue/black ink)
    ink_colors = [
        (0, 0, 139, 255),      # Dark blue
        (25, 25, 112, 255),    # Midnight blue
        (0, 0, 0, 255),        # Black
        (47, 79, 79, 255)      # Dark slate gray
    ]
    color = random.choice(ink_colors)
    
    x_offset = random.randint(5, 20)
    y_offset = random.randint(10, 30)
    
    # Draw the signature
    draw.text((x_offset, y_offset), name, fill=color, font=font)
    
    # Add slight rotation for natural look
    angle = random.uniform(-3, 3)
    image = image.rotate(angle, expand=False, fillcolor=(255, 255, 255, 0))
    
    # Save as PNG with transparency
    image.save(output_path, 'PNG')
    return output_path

def generate_malaysian_loan_applications(n=30):
    # Generate Malaysian loan application data
    data = []
        
    for i in range(n):
        gender = random.choice(['Male', 'Female'])
        property_area_type = random.choice(['Urban', 'Semiurban', 'Rural'])
        property_area_value = {'Urban': 0.0, 'Semiurban': 1.0, 'Rural': 2.0}[property_area_type]
        
        income_ranges = {
            'low': (2500, 4500),
            'medium': (4500, 8000),
            'high': (8000, 15000)
        }
        income_bracket = random.choice(['low', 'medium', 'high'])
        applicant_income = random.randint(*income_ranges[income_bracket])
        
        if income_bracket == 'high':
            credit_history = random.choices([1, 0], weights=[95, 5])[0]  
        elif income_bracket == 'medium':
            credit_history = random.choices([1, 0], weights=[80, 20])[0]  
        else:  # low income
            credit_history = random.choices([1, 0], weights=[60, 40])[0]  
        
        full_name = generate_malaysian_name(gender)
        
        app = {
            'application_id': f'MYS{2024}{1000+i}',
            'full_name': full_name,
            'ic_number': generate_malaysian_ic(),
            'gender': gender,
            'marital_status': random.choice(['Married', 'Single']),
            'dependents': random.randint(0, 4),
            'education': random.choice(['Graduate', 'Not Graduate']),
            'self_employed': random.choice(['Yes', 'No']),
            'applicant_income': applicant_income,
            'coapplicant_income': random.randint(0, 5000) if random.random() > 0.3 else 0,
            'loan_amount': random.randint(50, 500),
            'loan_term': random.choice([120, 180, 240, 360]),
            'credit_history': credit_history,
            'property_area': property_area_type,
            'property_area_value': property_area_value,
            'email': generate_malaysian_email(full_name),
            'phone': generate_malaysian_phone(),
            'address': generate_malaysian_address(property_area_type),
            'has_signature': random.choices([True, False], weights=[85, 15])[0], 
            'application_date': fake.date_between(start_date='-30d', end_date='today')
        }
        data.append(app)
            
    return data
    
    
def generate_test_scenarios():
    # Generate specific test cases - GUARANTEED approvals and rejections for demo purposes/testing
    scenarios = []
    
    # STRONG applications (Approved)
    print("Generating STRONG applications")
    for i in range(1):
        scenarios.append({
            'application_id': f'STRONG{2024}{i}',
            'full_name': generate_malaysian_name(random.choice(['Male', 'Female'])),
            'ic_number': generate_malaysian_ic(),
            'gender': random.choice(['Male', 'Female']),
            'marital_status': 'Married',
            'dependents': random.randint(0, 2),  # Few dependents
            'education': 'Graduate',
            'self_employed': 'No',
            'applicant_income': random.randint(8000, 12000),  # High income
            'coapplicant_income': random.randint(3000, 5000),  # Additional income
            'loan_amount': random.randint(100, 200),  # Reasonable loan
            'loan_term': 360,
            'credit_history': 1,  # GOOD CREDIT
            'property_area': 'Urban',
            'property_area_value': 0.0,
            'email': generate_malaysian_email('Test Strong'),
            'phone': generate_malaysian_phone(),
            'address': generate_malaysian_address('Urban'),
            'has_signature': True,  # Always signed
            'application_date': fake.date_this_month()
        })
    
    # WEAK applications 
    print("Generating WEAK applications")
    for i in range(1):
        scenarios.append({
            'application_id': f'WEAK{2024}{i}',
            'full_name': generate_malaysian_name(random.choice(['Male', 'Female'])),
            'ic_number': generate_malaysian_ic(),
            'gender': random.choice(['Male', 'Female']),
            'marital_status': 'Single',
            'dependents': random.randint(3, 4),  # Many dependents
            'education': 'Not Graduate',
            'self_employed': 'Yes',
            'applicant_income': random.randint(2000, 3000),  # Low income
            'coapplicant_income': 0,  # No additional income
            'loan_amount': random.randint(350, 450),  # High loan amount
            'loan_term': 180,
            'credit_history': 0,  # POOR CREDIT
            'property_area': 'Rural',
            'property_area_value': 2.0,
            'email': generate_malaysian_email('Test Weak'),
            'phone': generate_malaysian_phone(),
            'address': generate_malaysian_address('Rural'),
            'has_signature': True,
            'application_date': fake.date_this_month()
        })
    
    return scenarios

def create_malaysian_loan_pdf(application, output_folder='malaysian_pdfs'):
    # Create professional Malaysian loan application PDF with signature
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Create signature folder
    sig_folder = 'signatures'
    if not os.path.exists(sig_folder):
        os.makedirs(sig_folder)
    
    filename = f"{output_folder}/loan_app_{application['application_id']}.pdf"
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    
    # Professional header
    c.setFillColor(HexColor('#1e3a8a'))
    c.rect(0, height - 1.5*inch, width, 1.5*inch, fill=True, stroke=False)
    
    c.setFillColor(HexColor('#ffffff'))
    c.setFont("Helvetica-Bold", 24)
    c.drawString(1*inch, height - 0.7*inch, "BANK MALAYSIA")
    
    c.setFont("Helvetica", 14)
    c.drawString(1*inch, height - 1*inch, "Personal Loan Application Form")
    
    c.setFont("Helvetica", 10)
    app_date = application.get('application_date', datetime.now()).strftime("%d %B %Y")
    c.drawString(1*inch, height - 1.25*inch, f"Application Date: {app_date}")
    
    # Reset to black
    c.setFillColor(HexColor('#000000'))
    
    # Application ID
    y = height - 2*inch
    c.setFillColor(HexColor('#f0f9ff'))
    c.rect(0.8*inch, y - 0.1*inch, 6.5*inch, 0.35*inch, fill=True, stroke=True)
    c.setFillColor(HexColor('#000000'))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, y, f"Application Reference: {application['application_id']}")
    
    # Personal Information
    y -= 0.6*inch
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(HexColor('#1e3a8a'))
    c.drawString(1*inch, y, "SECTION A: PERSONAL INFORMATION")
    c.setFillColor(HexColor('#000000'))
    y -= 0.05*inch
    c.line(1*inch, y, 7.3*inch, y)
    y -= 0.35*inch
    
    personal_fields = [
        ("Full Name (as per IC)", application['full_name']),
        ("IC Number", application['ic_number']),
        ("Gender", application['gender']),
        ("Marital Status", application['marital_status']),
        ("Number of Dependents", str(application['dependents'])),
        ("Email Address", application['email']),
        ("Contact Number", application['phone']),
        ("Residential Address", application['address'][:70])
    ]
    
    for label, value in personal_fields:
        c.setFont("Helvetica-Bold", 9)
        c.drawString(1*inch, y, label + ":")
        c.setFont("Helvetica", 9)
        c.drawString(3.2*inch, y, str(value))
        y -= 0.25*inch
    
    # Employment Information
    y -= 0.3*inch
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(HexColor('#1e3a8a'))
    c.drawString(1*inch, y, "SECTION B: EMPLOYMENT & INCOME")
    c.setFillColor(HexColor('#000000'))
    y -= 0.05*inch
    c.line(1*inch, y, 7.3*inch, y)
    y -= 0.35*inch
    
    employment_fields = [
        ("Education Level", application['education']),
        ("Employment Status", "Self-Employed" if application['self_employed'] == 'Yes' else "Employed"),
        ("Monthly Income", f"RM {application['applicant_income']:,}"),
        ("Co-Applicant Income", f"RM {application['coapplicant_income']:,}"),
        ("Total Household Income", f"RM {application['applicant_income'] + application['coapplicant_income']:,}")
    ]
    
    for label, value in employment_fields:
        c.setFont("Helvetica-Bold", 9)
        c.drawString(1*inch, y, label + ":")
        c.setFont("Helvetica", 9)
        c.drawString(3.2*inch, y, str(value))
        y -= 0.25*inch
    
    # Loan Details
    y -= 0.3*inch
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(HexColor('#1e3a8a'))
    c.drawString(1*inch, y, "SECTION C: LOAN DETAILS")
    c.setFillColor(HexColor('#000000'))
    y -= 0.05*inch
    c.line(1*inch, y, 7.3*inch, y)
    y -= 0.35*inch
    
    loan_fields = [
        ("Loan Amount Requested", f"RM {application['loan_amount']:,},000"),
        ("Loan Tenure", f"{application['loan_term']} months ({application['loan_term']//12} years)"),
        ("Credit History Status", "Good Standing" if application['credit_history'] == 1 else "Poor Standing"),  # Make it clear!
        ("Property Location Type", application['property_area'])
    ]
    
    for label, value in loan_fields:
        c.setFont("Helvetica-Bold", 9)
        c.drawString(1*inch, y, label + ":")
        c.setFont("Helvetica", 9)
        c.drawString(3.2*inch, y, str(value))
        y -= 0.25*inch
    
    # Signature Section
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, y, "APPLICANT DECLARATION & SIGNATURE")
    
    y -= 0.25*inch
    c.setFont("Helvetica", 8)
    c.drawString(1*inch, y, "I declare that all information provided in this application is true and accurate to the best of my knowledge.")
    
    y -= 0.9*inch  
    
    
    # LEFT BOX - SIGNATURE
    signature_box_x = 1*inch
    signature_box_y = y
    signature_box_width = 3*inch
    signature_box_height = 0.6*inch
    
    # Draw signature box
    c.setStrokeColor(HexColor('#1e3a8a'))
    c.setLineWidth(2)
    c.rect(signature_box_x, signature_box_y, signature_box_width, signature_box_height, fill=False, stroke=True)
    c.setStrokeColor(HexColor('#000000'))
    c.setLineWidth(1)
    
    # Label above signature box
    c.setFont("Helvetica-Bold", 9)
    c.drawString(signature_box_x, signature_box_y + signature_box_height + 0.15*inch, "Applicant Signature:")
    
    # Add signature inside the box
    if application['has_signature']:
        # Generate signature image
        sig_path = f"{sig_folder}/sig_{application['application_id']}.png"
        generate_signature_image(application['full_name'], sig_path)
        
        # Add signature image centered in the box
        try:
            c.drawImage(sig_path, 
                       signature_box_x + 0.1*inch,
                       signature_box_y + 0.1*inch,
                       width=signature_box_width - 0.2*inch,
                       height=signature_box_height - 0.2*inch,
                       mask='auto', 
                       preserveAspectRatio=True)
        except:
            # Fallback to text signature
            c.setFont("Times-Italic", 14)
            c.setFillColor(HexColor('#1e3a8a'))
            c.drawString(signature_box_x + 0.2*inch, signature_box_y + 0.25*inch, application['full_name'])
            c.setFillColor(HexColor('#000000'))
        
        # Signed indicator below signature box
        c.setFont("Helvetica", 7)
        c.setFillColor(HexColor('#006400'))
        c.drawString(signature_box_x, signature_box_y - 0.15*inch, f"✓ Digitally signed on {app_date}")
        c.setFillColor(HexColor('#000000'))
    else:
        # Unsigned placeholder
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(HexColor('#999999'))
        c.drawString(signature_box_x + 0.8*inch, signature_box_y + 0.25*inch, "[ Unsigned ]")
        c.setFillColor(HexColor('#000000'))
    
    # RIGHT BOX - DATE
    date_box_x = 4.5*inch
    date_box_y = y
    date_box_width = 2*inch
    date_box_height = 0.6*inch
    
    # Draw date box
    c.setStrokeColor(HexColor('#1e3a8a'))
    c.setLineWidth(2)
    c.rect(date_box_x, date_box_y, date_box_width, date_box_height, fill=False, stroke=True)
    c.setStrokeColor(HexColor('#000000'))
    c.setLineWidth(1)
    
    # Label above date box
    c.setFont("Helvetica-Bold", 9)
    c.drawString(date_box_x, date_box_y + date_box_height + 0.15*inch, "Date:")
    
    # Add date inside the box (centered)
    c.setFont("Helvetica", 10)
    c.drawString(date_box_x + 0.3*inch, date_box_y + 0.25*inch, app_date)
    
    # Footer
    c.setFont("Helvetica", 7)
    c.setFillColor(HexColor('#666666'))
    c.drawString(1*inch, 0.5*inch, "Bank Malaysia Berhad (123456-X) | Banking License: 9876543210")
    c.drawString(1*inch, 0.35*inch, "Address: Menara Bank Malaysia, Jalan Raja Chulan, 50200 Kuala Lumpur")
    
    c.save()
    print(f"Created: {filename}")
    return filename

if __name__ == "__main__":
    
     # Generate random applications
    print("\n Generating random applications...")
    random_apps = generate_malaysian_loan_applications(30) # here to change how much pdf to generate
    print(f"Generated {len(random_apps)} random applications")
    
    # Generate test scenarios
    print("\n Generating test scenarios...")
    test_cases = generate_test_scenarios()
    print(f" Generated {len(test_cases)} test scenarios")
    
    # Combine all applications
    all_apps = random_apps + test_cases
    df = pd.DataFrame(all_apps)
    
    # Save to Excel
    df.to_excel('malaysian_loan_applications.xlsx', index=False)
    print(f"\n Saved {len(all_apps)} applications to Excel")
    
    # Show statistics
    good_credit = sum(1 for app in all_apps if app['credit_history'] == 1)
    signed = sum(1 for app in all_apps if app['has_signature'])
    
    print(f"\n Statistics:")
    print(f"   Total Applications: {len(all_apps)}")
    print(f"   Good Credit: {good_credit} ({good_credit/len(all_apps)*100:.1f}%)")
    print(f"   Poor Credit: {len(all_apps)-good_credit}")
    print(f"   Signed: {signed}")
    print(f"   Unsigned: {len(all_apps)-signed}")
    
    # Create PDFs
    print(f"\n Creating PDF files...")
    for idx, row in df.iterrows():
        create_malaysian_loan_pdf(row)
    
    print(f"\n All PDFs created in 'malaysian_pdfs/' folder")
    print(f" Excel data saved as 'malaysian_loan_applications.xlsx'")
    