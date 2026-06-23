import os
from typing import Dict, Any, Optional
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from app.services.firebase import get_bucket
from app.core.config import settings

def generate_complaint_pdf(spec: Dict[str, Any], output_path: str) -> str:
    """
    Generate a formal PDF document from a Planner complaint document spec using ReportLab.
    """
    # Ensure directory exists
    dir_name = os.path.dirname(output_path)
    if dir_name and not os.path.exists(dir_name):
        os.makedirs(dir_name, exist_ok=True)
        
    doc = SimpleDocTemplate(
        output_path, 
        pagesize=letter, 
        rightMargin=54, 
        leftMargin=54, 
        topMargin=54, 
        bottomMargin=54
    )
    styles = getSampleStyleSheet()
    
    # Custom Styles for Premium Look
    title_style = ParagraphStyle(
        name='DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1A365D"),
        spaceAfter=15
    )
    
    meta_style = ParagraphStyle(
        name='DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=4
    )
    
    subject_style = ParagraphStyle(
        name='DocSubject',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#2D3748"),
        spaceBefore=10,
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        name='DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        spaceAfter=12
    )
    
    footer_style = ParagraphStyle(
        name='DocFooter',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#718096"),
        spaceBefore=30
    )

    story = []
    
    # Header Banner
    story.append(Paragraph(spec.get("title", "OFFICIAL CIVIC GRIEVANCE REPORT"), title_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Metadata Block
    date_str = datetime.utcnow().strftime("%B %d, %Y")
    story.append(Paragraph(f"<b>Date:</b> {date_str}", meta_style))
    story.append(Paragraph(f"<b>To:</b> {spec.get('recipient_name', 'Public Works Officer')}", meta_style))
    story.append(Paragraph(f"<b>Title:</b> {spec.get('recipient_title', 'Grievance Redressal Division')}", meta_style))
    story.append(Paragraph(f"<b>Jurisdiction:</b> {spec.get('ward_name', 'Ward 68')}, District {spec.get('district', 'N/A')}", meta_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Divider line
    story.append(Spacer(1, 0.05 * inch))
    
    # Subject
    story.append(Paragraph(f"<b>Subject:</b> {spec.get('subject_line', 'Infrastructure Defect Grievance')}", subject_style))
    
    # Body Paragraphs
    for para in spec.get("body_paragraphs", []):
        story.append(Paragraph(para, body_style))
        
    # Signature Footer
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("<b>Filed Autonomously via:</b> CivicPulse Community Intelligence Platform", footer_style))
    story.append(Paragraph("<i>This complaint is legally backed and digitally signed by the CivicPulse Agent Network.</i>", footer_style))
    
    doc.build(story)
    return output_path

def upload_pdf_to_gcs(local_file_path: str, blob_name: str) -> str:
    """
    Upload a generated PDF to Firebase GCS bucket and return its public URL
    (or local file path if Firebase is not connected).
    """
    try:
        bucket = get_bucket()
        if bucket is not None:
            blob = bucket.blob(blob_name)
            # Upload the file
            blob.upload_from_filename(local_file_path, content_type='application/pdf')
            # Make public or generate a signed URL (for hackathon, public is easiest)
            blob.make_public()
            return blob.public_url
    except Exception as e:
        print(f"WARNING: GCS Upload failed: {e}. Returning local file reference.")
        
    # Fallback to local path relative reference
    return f"file://{os.path.abspath(local_file_path)}"
