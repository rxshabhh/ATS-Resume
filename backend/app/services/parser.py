import pdfplumber
from docx import Document

def extract_text(file):
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(file.file) as pdf:
            return " ".join(page.extract_text() or "" for page in pdf.pages)

    if file.filename.endswith(".docx"):
        doc = Document(file.file)
        return " ".join(p.text for p in doc.paragraphs)

    return ""
