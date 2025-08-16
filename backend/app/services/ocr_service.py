import pytesseract
from PIL import Image, ImageEnhance
import io
import os
import base64
from fastapi import HTTPException
from typing import Optional, Dict, Any


class OCRService:
    @staticmethod
    def _get_tesseract_path():
        """Get Tesseract executable path"""
        # Common Windows installation paths
        possible_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', '')),
            "tesseract"  # If it's in PATH
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
        
        # If not found in common paths, try to find it in PATH
        import shutil
        tesseract_path = shutil.which("tesseract")
        if tesseract_path:
            return tesseract_path
        
        return None

    @staticmethod
    def preprocess_image(image: Image.Image, options: Dict[str, Any]) -> Image.Image:
        """Preprocess image based on user options"""
        processed_image = image.copy()
        
        # Apply rotation
        if options.get('rotation', 0) != 0:
            rotation = options['rotation']
            if rotation == 90:
                processed_image = processed_image.rotate(-90, expand=True)
            elif rotation == 180:
                processed_image = processed_image.rotate(180, expand=True)
            elif rotation == 270:
                processed_image = processed_image.rotate(90, expand=True)
        
        # Apply cropping
        if options.get('crop'):
            crop_data = options['crop']
            left = int(crop_data['x'])
            top = int(crop_data['y'])
            right = int(crop_data['x'] + crop_data['width'])
            bottom = int(crop_data['y'] + crop_data['height'])
            processed_image = processed_image.crop((left, top, right, bottom))
        
        # Convert to grayscale if requested
        if options.get('grayscale', False):
            processed_image = processed_image.convert('L')
        
        # Apply contrast enhancement if requested
        if options.get('enhance_contrast', False):
            enhancer = ImageEnhance.Contrast(processed_image)
            processed_image = enhancer.enhance(1.5)
        
        return processed_image

    @staticmethod
    def image_to_base64(image: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    async def extract_text_from_image(image_bytes: bytes, preprocessing_options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Extract text from image using pytesseract OCR with preprocessing"""
        try:
            # Set Tesseract path
            tesseract_path = OCRService._get_tesseract_path()
            if tesseract_path:
                pytesseract.pytesseract.tesseract_cmd = tesseract_path
            
            # Convert bytes to PIL Image
            original_image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if original_image.mode != 'RGB':
                original_image = original_image.convert('RGB')
            
            # Apply preprocessing if options provided
            if preprocessing_options:
                processed_image = OCRService.preprocess_image(original_image, preprocessing_options)
                # Convert processed image to base64 for preview
                processed_preview = OCRService.image_to_base64(processed_image)
            else:
                processed_image = original_image
                processed_preview = None
            
            # Extract text using pytesseract
            extracted_text = pytesseract.image_to_string(processed_image, lang='eng')
            
            # Clean up the text
            cleaned_text = extracted_text.strip()
            
            return {
                "extracted_text": cleaned_text,
                "processed_preview": processed_preview,
                "original_size": original_image.size,
                "processed_size": processed_image.size
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing image: {str(e)}"
            )
