import os
import pymupdf  # Fixed: use pymupdf directly
import base64
import uuid
from fastapi import UploadFile, HTTPException
from docx import Document
from app.core.config import settings
from app.services.utils import clean_filename

def save_file(file: UploadFile, folder: str = "rubrics") -> str:
    # Validate extension
    allowed_extensions = {'.pdf', '.png', '.jpg', '.jpeg', '.docx', '.txt', '.csv'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        )
    
    upload_dir = os.path.join(settings.UPLOAD_DIR, folder)
    os.makedirs(upload_dir, exist_ok=True)
    
    # FIXED: Add unique prefix to prevent silent file overwrites
    safe_filename = clean_filename(file.filename)
    unique_prefix = uuid.uuid4().hex[:8]
    unique_filename = f"{unique_prefix}_{safe_filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
        
    return file_path

def convert_file_to_base64_images(file_path: str, target_dpi: int = 150) -> list[str]:
    """Convert PDF/Image to base64 images for the Vision AI."""
    images_base64 = []
    
    if file_path.lower().endswith('.pdf'):
        doc = pymupdf.open(file_path)
        for page in doc:
            pix = page.get_pixmap(dpi=target_dpi, alpha=False)
            img_bytes = pix.tobytes("png")
            images_base64.append(base64.b64encode(img_bytes).decode("utf-8"))
        doc.close()
    elif file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
        with open(file_path, "rb") as img_file:
            img_bytes = img_file.read()
            images_base64.append(base64.b64encode(img_bytes).decode("utf-8"))
            
    if not images_base64:
        raise HTTPException(status_code=400, detail="Could not process the file into images.")
        
    return images_base64

def extract_text_from_document(file_path: str) -> str:
    """Extract raw text from docx, txt, or csv instantly without AI."""
    text = ""
    
    if file_path.lower().endswith('.docx'):
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    elif file_path.lower().endswith(('.txt', '.csv')):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
            
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the document.")
        
    return text