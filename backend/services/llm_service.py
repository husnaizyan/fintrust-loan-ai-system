import anthropic
import os
import re
from dotenv import load_dotenv

load_dotenv()

class LoanExplainerService:
    
    def __init__(self):
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def generate_explanation(self, loan_data, prediction):
        
        # Calculate key metrics
        income = loan_data.get('ApplicantIncome', 0)
        coapplicant_income = loan_data.get('CoapplicantIncome', 0)
        total_income = income + coapplicant_income
        loan_amount = loan_data.get('LoanAmount', 0) * 1000  # Convert to full amount
        loan_term_months = loan_data.get('Loan_Amount_Term', 360)
        
        # Calculate DTI (simplified - monthly loan payment / monthly income)
        monthly_payment = loan_amount / loan_term_months if loan_term_months > 0 else 0
        dti_ratio = (monthly_payment / total_income * 100) if total_income > 0 else 0
        
        # Get other details
        credit_history = 'Good Standing' if loan_data.get('Credit_History', 0) == 1 else 'Poor Standing'
        employment = 'Self-Employed' if loan_data.get('Self_Employed', 0) == 1 else 'Employed'
        dependents = int(loan_data.get('Dependents', 0))
        property_areas = ['Urban', 'Semiurban', 'Rural']
        property_area = property_areas[int(loan_data.get('Property_Area', 0))]
        education = 'Graduate' if loan_data.get('Education', 0) == 0 else 'Not Graduate'
        married = 'Yes' if loan_data.get('Married', 0) == 1 else 'No'
        
        prompt = f"""You are an AI assistant providing decision support to a bank loan officer reviewing a loan application.

Your role is to provide objective, professional risk assessment to help the officer make informed lending decisions.

APPLICATION DATA:
- Applicant Income: RM {income:,.2f}/month
- Co-applicant Income: RM {coapplicant_income:,.2f}/month
- Total Household Income: RM {total_income:,.2f}/month
- Loan Amount Requested: RM {loan_amount:,.2f}
- Loan Term: {loan_term_months} months ({loan_term_months/12:.1f} years)
- Monthly Payment (approx): RM {monthly_payment:,.2f}
- Debt-to-Income Ratio: {dti_ratio:.1f}%
- Credit History: {credit_history}
- Employment Status: {employment}
- Education Level: {education}
- Marital Status: {married}
- Number of Dependents: {dependents}
- Property Location: {property_area}

ML MODEL DECISION: {prediction}

INSTRUCTIONS:
Provide a professional risk assessment for the loan officer in the following format:

**Risk Assessment Summary:**
[1-2 sentences giving overall assessment and recommendation]

**Key Risk Factors:**
• [List 2-4 main concerns or red flags]
• [Each point should be specific and data-driven]

**Positive Factors:**
• [List 2-3 strengths in the application]
• [Focus on factors that support approval]

**Financial Analysis:**
• DTI Ratio: [Comment on the {dti_ratio:.1f}% ratio - is it acceptable? Industry standard is <40%]
• Income Stability: [Assess based on employment status and income level]
• Repayment Capacity: [Can applicant afford RM {monthly_payment:,.2f}/month?]

**Recommendation:**
[Clear recommendation: APPROVE / REJECT / CONDITIONAL APPROVAL]
[If conditional, specify conditions like: require guarantor, increase down payment, higher interest rate, etc.]

**Officer Notes:**
[Any additional considerations, compliance issues, or follow-up actions needed]

Keep the tone professional, objective, and data-driven. This is for internal bank use, not customer communication."""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            explanation = response.content[0].text
            
            # Clean up formatting
            explanation = self._clean_text(explanation)
            
            return {
                "explanation": explanation.strip(),
                "metrics": {
                    "dti_ratio": round(dti_ratio, 2),
                    "monthly_payment": round(monthly_payment, 2),
                    "total_income": round(total_income, 2),
                    "loan_to_income_ratio": round((loan_amount / (total_income * 12)) * 100, 2) if total_income > 0 else 0
                }
            }
            
        except Exception as e:
            print(f"Error generating explanation: {str(e)}")
            return {
                "explanation": f"**Decision: {prediction}**\n\nUnable to generate detailed risk assessment at this time. Please review application manually.",
                "metrics": {
                    "dti_ratio": round(dti_ratio, 2),
                    "monthly_payment": round(monthly_payment, 2),
                    "total_income": round(total_income, 2),
                    "loan_to_income_ratio": 0
                }
            }
    
    def answer_question(self, question, application_context):
        
        data = application_context.get('data', {})
        prediction = application_context.get('prediction', 'Unknown')
        
        # Calculate metrics
        income = data.get('ApplicantIncome', 0)
        coapplicant_income = data.get('CoapplicantIncome', 0)
        total_income = income + coapplicant_income
        loan_amount = data.get('LoanAmount', 0) * 1000
        loan_term = data.get('Loan_Amount_Term', 360)
        monthly_payment = loan_amount / loan_term if loan_term > 0 else 0
        dti_ratio = (monthly_payment / total_income * 100) if total_income > 0 else 0
        
        credit_history = 'Good' if data.get('Credit_History', 0) == 1 else 'Poor'
        
        prompt = f"""You are an AI assistant helping a bank loan officer analyze a loan application.

OFFICER'S QUESTION: "{question}"

APPLICATION SUMMARY:
- Decision: {prediction}
- Applicant Income: RM {income:,.2f}
- Total Household Income: RM {total_income:,.2f}
- Loan Amount: RM {loan_amount:,.2f}
- Monthly Payment: RM {monthly_payment:,.2f}
- DTI Ratio: {dti_ratio:.1f}%
- Credit History: {credit_history}

PREVIOUS RISK ASSESSMENT:
{application_context.get('explanation', 'No previous assessment available')}

INSTRUCTIONS:
- Provide a clear, professional answer from the loan officer's perspective
- Be specific and data-driven
- Include numbers and calculations when relevant
- Suggest actionable next steps if applicable
- Keep response concise (3-5 short paragraphs maximum)
- Use bullet points when listing multiple items

Answer the officer's question:"""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=600,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            answer = response.content[0].text
            answer = self._clean_text(answer)
            
            return answer.strip()
            
        except Exception as e:
            print(f"Error generating answer: {str(e)}")
            return "I apologize, but I'm having trouble processing your question right now. Please try again or contact technical support."
    
    def suggest_alternative_terms(self, loan_data, original_decision):
        # Suggest alternative loan terms if application was rejected
        
        if original_decision.lower() == "approved":
            return "Application already approved. No alternative terms needed."
        
        income = loan_data.get('ApplicantIncome', 0)
        coapplicant_income = loan_data.get('CoapplicantIncome', 0)
        total_income = income + coapplicant_income
        loan_amount = loan_data.get('LoanAmount', 0) * 1000
        credit_history = 'Good' if loan_data.get('Credit_History', 0) == 1 else 'Poor'
        
        prompt = f"""You are helping a loan officer find alternative solutions for a rejected loan application.

CURRENT APPLICATION:
- Total Income: RM {total_income:,.2f}
- Requested Loan: RM {loan_amount:,.2f}
- Credit History: {credit_history}
- Original Decision: REJECTED

TASK:
Suggest 3 alternative options that might make this application approvable:

**Option 1: Reduced Loan Amount**
[Calculate and suggest appropriate loan amount based on 30% DTI ratio]

**Option 2: Extended Loan Term**
[Suggest longer term to reduce monthly payments]

**Option 3: Additional Requirements**
[Suggest conditions like: co-signer, higher down payment, collateral, etc.]

For each option, include:
- Specific numbers and terms
- Why this would improve approval chances
- Any trade-offs or additional requirements

Keep suggestions practical and realistic."""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=600,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            suggestions = response.content[0].text
            suggestions = self._clean_text(suggestions)
            
            return suggestions.strip()
            
        except Exception as e:
            print(f"Error generating suggestions: {str(e)}")
            return "Unable to generate alternative terms at this time."
    
    def _clean_text(self, text):
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove excessive newlines (more than 2 in a row)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Ensure proper spacing after periods
        text = re.sub(r'\.([A-Z])', r'. \1', text)
        
        # Remove markdown code blocks if any
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        
        return text


# Test the service
if __name__ == "__main__":
    service = LoanExplainerService()
    
    # Test data
    test_data = {
        'ApplicantIncome': 5000,
        'CoapplicantIncome': 2000,
        'LoanAmount': 200,  # In thousands
        'Loan_Amount_Term': 360,
        'Credit_History': 0,  # Poor
        'Self_Employed': 1,
        'Dependents': 2,
        'Education': 0,
        'Married': 1,
        'Property_Area': 2
    }
    
    # Test explanation generation
    result = service.generate_explanation(test_data, "Rejected")
    print("\n RISK ASSESSMENT:")
    print(result['explanation'])
    print("\n KEY METRICS:")
    print(f"  - DTI Ratio: {result['metrics']['dti_ratio']}%")
    print(f"  - Monthly Payment: RM {result['metrics']['monthly_payment']:,.2f}")
    
    print("\n" + "="*70)
    print("Test complete!")
