import pytesseract
from PIL import Image
import io
from fastapi import HTTPException


class OCRService:
    @staticmethod
    async def extract_text_from_image(image_bytes: bytes) -> str:
        """Extract text from image using pytesseract OCR"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text using pytesseract
            extracted_text = pytesseract.image_to_string(image, lang='eng')
            
            # Clean up the text
            cleaned_text = extracted_text.strip()
            
            return cleaned_text
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing image: {str(e)}"
            )
