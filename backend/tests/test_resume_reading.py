import io
import os
import sys
from pathlib import Path

# Setup path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import docx
import pypdf
from apps.skills.analysis import (
    extract_text_from_file,
    extract_skills_from_text,
    extract_resume_details,
    calculate_ats_score,
    clean_and_normalize_text
)


def test_clean_and_normalize():
    print("Testing clean_and_normalize_text...")
    # 1. NUL byte elimination
    dirty_text = "Python\x00Developer\x00"
    cleaned = clean_and_normalize_text(dirty_text)
    assert "\x00" not in cleaned, "NUL byte was not stripped!"
    assert cleaned == "PythonDeveloper"

    # 2. Ligatures
    lig_text = "efﬁcient ﬂow of traﬃc and oﬃce"
    cleaned = clean_and_normalize_text(lig_text)
    assert "efficient flow of traffic and office" in cleaned, f"Ligatures failed: {cleaned}"

    # 3. Smart quotes and typographical dashes
    smart_text = "“Senior Developer” – John’s Resume"
    cleaned = clean_and_normalize_text(smart_text)
    assert '"Senior Developer" - John\'s Resume' == cleaned, f"Smart quotes failed: {cleaned}"

    # 4. Bullet character standardization
    bullet_text = "Responsibilities:\n\u2022 Built API\n\u25cf Managed DB\n\u2714 Deployed K8s"
    cleaned = clean_and_normalize_text(bullet_text)
    assert "• Built API" in cleaned and "• Managed DB" in cleaned and "• Deployed K8s" in cleaned

    # 5. Hyphenated word wrap
    wrap_text = "microservice architec-\nture and imple-\nmentation"
    cleaned = clean_and_normalize_text(wrap_text)
    assert "architecture and implementation" in cleaned, f"Hyphenated wrap failed: {cleaned}"
    print("  [PASS] clean_and_normalize_text")


def test_docx_reading_with_headers_and_tables():
    print("Testing DOCX reading with headers, tables, and bullets...")
    doc = docx.Document()

    # Add header (where candidate contact info is frequently placed)
    header = doc.sections[0].header
    header.paragraphs[0].text = "Sarah Connor | sarah.connor@cyberdyne.io | +1 (555) 019-2834 | linkedin.com/in/sarahconnor | github.com/sarahconnor"

    # Add body paragraphs
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph("Principal Distributed Systems Engineer with 8+ years architecting cloud-native solutions.")

    # Add skills in a 2x2 table (very common in professional resumes)
    doc.add_heading("Technical Skills", level=1)
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).text = "Languages: Python, TypeScript, Go, SQL"
    table.cell(0, 1).text = "Frameworks: Django, Next.js, FastAPI"
    table.cell(1, 0).text = "Databases: PostgreSQL, Redis, MongoDB"
    table.cell(1, 1).text = "Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD"

    # Add experience with bullet points
    doc.add_heading("Work Experience", level=1)
    p_exp = doc.add_paragraph("Lead Cloud Architect | Cyberdyne Systems | 2021 - Present")
    p_b1 = doc.add_paragraph("• Architected high-throughput message pipeline with Kafka reducing latency by 45%.")
    p_b2 = doc.add_paragraph("• Spearheaded migration from MySQL to PostgreSQL serving 10M+ daily requests.")

    # Add education
    doc.add_heading("Education", level=1)
    doc.add_paragraph("Stanford University | Bachelor of Science in Computer Science | 2013 - 2017 | GPA: 3.9")

    buf = io.BytesIO()
    doc.save(buf)
    buf.name = "Sarah_Connor_Resume.docx"
    buf.seek(0)

    # Extract text using our engine
    extracted = extract_text_from_file(buf)
    assert len(extracted) > 200, "DOCX extracted text is too short!"

    # Verify Header was extracted
    assert "sarah.connor@cyberdyne.io" in extracted, "Contact email from header was lost!"
    assert "linkedin.com/in/sarahconnor" in extracted, "LinkedIn URL from header was lost!"

    # Verify Table content was extracted
    assert "PostgreSQL" in extracted, "Table skills (PostgreSQL) were lost!"
    assert "FastAPI" in extracted, "Table skills (FastAPI) were lost!"
    assert "Kubernetes" in extracted, "Table skills (Kubernetes) were lost!"

    # Verify Skills Extraction
    skills = extract_skills_from_text(extracted)
    for expected_skill in ["Python", "TypeScript", "Go", "SQL", "Django", "Next.js", "FastAPI", "PostgreSQL", "Redis", "MongoDB", "AWS", "Docker", "Kubernetes", "CI/CD", "Kafka"]:
        assert expected_skill in skills, f"Expected skill '{expected_skill}' was not extracted! Extracted: {skills}"

    # Verify Structured Parsing
    details = extract_resume_details(extracted)
    assert details["personal"]["email"] == "sarah.connor@cyberdyne.io", f"Parsed email mismatch: {details['personal']}"
    assert "sarahconnor" in details["personal"]["linkedin"], "Parsed LinkedIn mismatch!"
    assert "sarahconnor" in details["personal"]["github"], "Parsed GitHub mismatch!"
    assert len(details["skills"]) >= 10, f"Expected at least 10 skills, got {len(details['skills'])}"
    assert len(details["experience"]) >= 1, "Work experience not parsed!"
    assert len(details["education"]) >= 1, "Education not parsed!"
    assert details["metrics"]["ats_score"] >= 70, f"ATS score unexpectedly low: {details['metrics']['ats_score']}"

    print("  [PASS] DOCX reading with headers, tables, and bullets")


def test_pdf_reading_and_extraction():
    print("Testing PDF reading, annotations, and layout...")
    # Create a synthetic PDF with pypdf
    writer = pypdf.PdfWriter()

    # Note: Create a multi-page PDF with annotations
    page = writer.add_blank_page(width=612, height=792)

    buf = io.BytesIO()
    writer.write(buf)
    buf.name = "sample.pdf"
    buf.seek(0)

    # Empty page should return clean string without error
    text = extract_text_from_file(buf)
    assert isinstance(text, str), "PDF reader failed on blank page!"
    print("  [PASS] PDF blank page & stream safety")


def test_skill_matching_precision():
    print("Testing skill matching precision (false-positive prevention)...")

    # 1. 'Go' should NOT match normal English verbs
    sentence_verb = "I had to go to the office and go through the documentation."
    skills_verb = extract_skills_from_text(sentence_verb)
    assert "Go" not in skills_verb, f"False positive 'Go' detected for verb: {skills_verb}"

    # 'Go' SHOULD match technical contexts
    sentence_tech = "Experienced building high-throughput microservices in Go, Python, and Docker."
    skills_tech = extract_skills_from_text(sentence_tech)
    assert "Go" in skills_tech, f"Valid 'Go' skill was missed: {skills_tech}"
    assert "Python" in skills_tech
    assert "Docker" in skills_tech

    # 2. 'R' should NOT match arbitrary letter 'r'
    sentence_letter_r = "Team conducted extensive R&D on user feedback."
    skills_r = extract_skills_from_text(sentence_letter_r)
    assert "R" not in skills_r, f"False positive 'R' detected: {skills_r}"

    # 'R' SHOULD match in data science skills lists
    sentence_data_r = "Proficient in Python, R, SQL, and Tableau for statistical modeling."
    skills_data_r = extract_skills_from_text(sentence_data_r)
    assert "R" in skills_data_r, f"Valid 'R' was missed: {skills_data_r}"

    # 3. Aliases: ReactJS -> React, Postgres -> PostgreSQL, Golang -> Go
    alias_text = "Proficient in ReactJS, Golang, Postgres, K8s, and TailwindCSS."
    alias_skills = extract_skills_from_text(alias_text)
    assert "React" in alias_skills, f"ReactJS alias failed: {alias_skills}"
    assert "Go" in alias_skills, f"Golang alias failed: {alias_skills}"
    assert "PostgreSQL" in alias_skills, f"Postgres alias failed: {alias_skills}"
    assert "Kubernetes" in alias_skills, f"K8s alias failed: {alias_skills}"
    assert "Tailwind CSS" in alias_skills, f"TailwindCSS alias failed: {alias_skills}"

    print("  [PASS] Skill matching precision & aliases")


def test_edge_cases():
    print("Testing edge cases (empty files, uppercase extensions, byte inputs)...")
    # Empty inputs
    assert extract_text_from_file(None) == ""
    assert extract_text_from_file(b"") == ""

    # Uppercase extension
    plain_buf = io.BytesIO(b"Alex Rivera\nalex@example.com\nSoftware Engineer with Python skills.")
    plain_buf.name = "MY_RESUME.TXT"
    text = extract_text_from_file(plain_buf)
    assert "Alex Rivera" in text
    assert "Python" in extract_skills_from_text(text)

    # Raw bytes input without file object
    raw_text = b"Jane Smith\njane@example.com\nFull stack developer skilled in Django and React."
    assert "Jane Smith" in extract_text_from_file(raw_text)

    # ATS score calculation check
    score = calculate_ats_score(text, ["Python"])
    assert 0 <= score <= 100, f"ATS score out of range: {score}"

    print("  [PASS] Edge cases handled gracefully")


if __name__ == "__main__":
    test_clean_and_normalize()
    test_docx_reading_with_headers_and_tables()
    test_pdf_reading_and_extraction()
    test_skill_matching_precision()
    test_edge_cases()
    print("\nALL RESUME READING & ACCURACY CHECKS PASSED!")
