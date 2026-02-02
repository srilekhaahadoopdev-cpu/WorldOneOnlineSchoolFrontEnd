
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import io
from datetime import datetime

def generate_student_report_pdf(student_name: str, courses_data: list):
    """
    Generates a PDF report card.
    courses_data: list of dicts { 'course_title': str, 'progress': int, 'score': int/str }
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # --- Header ---
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, "World One Online School")
    
    p.setFont("Helvetica", 14)
    p.setFillColor(colors.gray)
    p.drawString(50, height - 80, "Official Student Report Card")
    
    # --- Student Info ---
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 130, f"Student: {student_name}")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 150, f"Date: {datetime.now().strftime('%Y-%m-%d')}")

    # --- Table Header ---
    y = height - 200
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Course Name")
    p.drawString(350, y, "Progress")
    p.drawString(450, y, "Grade")
    p.line(50, y - 5, 550, y - 5)
    
    # --- Table Rows ---
    y -= 30
    p.setFont("Helvetica", 12)
    
    for course in courses_data:
        title = course.get('title', 'Unknown Course')
        progress = course.get('progress', 0)
        grade = course.get('grade', 'N/A')
        
        # Truncate title if too long
        if len(title) > 40:
            title = title[:37] + "..."
            
        p.drawString(50, y, title)
        p.drawString(350, y, f"{progress}%")
        p.drawString(450, y, str(grade))
        
        y -= 25
        if y < 50: # New Page if needed (basic)
            p.showPage()
            y = height - 50

    # --- Footer ---
    p.line(50, 50, 550, 50)
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, 35, "Generated automatically by World One Online School System.")

    p.save()
    buffer.seek(0)
    return buffer
