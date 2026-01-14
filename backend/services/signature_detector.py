import pdfplumber
from pdf2image import convert_from_path
import cv2
import numpy as np
from PIL import Image

def detect_signature_in_pdf(pdf_path):
    
    print(f"Checking signature in: {pdf_path}")
    
    try:
        # First, check text for "Unsigned" marker
        with pdfplumber.open(pdf_path) as pdf:
            text = pdf.pages[0].extract_text()
            
            print(f"Extracted text length: {len(text)} chars")
            
            # If we find explicit unsigned marker, return immediately
            if "[ Unsigned ]" in text or "Unsigned" in text:
                print("  ✗ Found 'Unsigned' text marker")
                return False, 25.0
            
            # Check for "Digitally signed" marker
            if "Digitally signed" in text or "✓" in text:
                print("  ✓ Found 'Digitally signed' text marker")
                return True, 95.0
        
        # If no text markers, fall back to image analysis
        images = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=1)
        
        if not images:
            print("Could not convert PDF to image")
            return False, 0.0
        
        page_image = np.array(images[0])
        gray = cv2.cvtColor(page_image, cv2.COLOR_RGB2GRAY)
        
        # Focus on signature area (bottom 30%)
        height = gray.shape[0]
        signature_area = gray[int(height * 0.7):height, :]
        
        # Apply threshold
        _, thresh = cv2.threshold(signature_area, 200, 255, cv2.THRESH_BINARY_INV)
        
        # Count ink pixels
        ink_pixels = np.count_nonzero(thresh)
        total_pixels = thresh.size
        ink_ratio = ink_pixels / total_pixels
        
        # Better confidence calculation
        if ink_ratio > 0.02:  # More than 2% ink = likely signed
            confidence = min(85.0 + (ink_ratio * 100), 98.0)
            has_signature = True
        elif ink_ratio > 0.01:  # 1-2% = uncertain
            confidence = 60.0 + (ink_ratio * 500)
            has_signature = ink_ratio > 0.015
        else:  # Less than 1% = likely unsigned
            confidence = ink_ratio * 3000
            has_signature = False
        
        status = "✓ SIGNED" if has_signature else "✗ UNSIGNED"
        print(f"  {status} - Ink Ratio: {ink_ratio:.4f} - Confidence: {confidence:.2f}%")
        
        return has_signature, confidence
        
    except Exception as e:
        print(f"Error detecting signature: {str(e)}")
        # If error, check for text markers as fallback
        try:
            with pdfplumber.open(pdf_path) as pdf:
                text = pdf.pages[0].extract_text()
                if "Digitally signed" in text:
                    return True, 90.0
                elif "[ Unsigned ]" in text:
                    return False, 20.0
        except:
            pass
        return False, 0.0
    
# Test function
if __name__ == "__main__":
    import os
    
    # Test with a few PDFs
    test_pdfs = [
        "malaysian_pdfs/loan_app_MYS20241000.pdf",
        "malaysian_pdfs/loan_app_MYS20241001.pdf",
        "malaysian_pdfs/loan_app_MYS20241002.pdf"
    ]
    
    for pdf_path in test_pdfs:
        if os.path.exists(pdf_path):
            print(f"\n{pdf_path}")
            has_sig, conf = detect_signature_in_pdf(pdf_path)
            print()
        else:
            print(f"\nFile not found: {pdf_path}")
    
    print("\nSignature detection test complete!")