import os
import fitz  # PyMuPDF
import base64
from fastapi import UploadFile, HTTPException
from docx import Document

def save_file(file: UploadFile, folder: str = "rubrics") -> str:
    # 1. Added .docx, .txt, .csv to allowed list
    if not file.filename.endswith(('.pdf', '.png', '.jpg', '.jpeg', '.docx', '.txt', '.csv')):
        raise HTTPException(status_code=400, detail="PDF, Image, DOCX, TXT, or CSV files are allowed")
    
    upload_dir = f"uploads/{folder}"
    os.makedirs(upload_dir, exist_ok=True)
    safe_filename = file.filename.replace(" ", "_")
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
        
    return file_path

def convert_file_to_base64_images(file_path: str, target_dpi: int = 150) -> list[str]:
    """Convert PDF/Image to base64 images for the Vision AI."""
    images_base64 = []
    
    if file_path.lower().endswith('.pdf'):
        doc = fitz.open(file_path)
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

# 2. NEW FUNCTION: Instant text extraction for docx/txt/csv
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