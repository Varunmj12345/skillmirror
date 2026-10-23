import io
import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

logger = logging.getLogger(__name__)


def validate_uploaded_document(file_obj, allowed_exts=('pdf', 'docx', 'txt'), max_mb=5):
    """
    Validates uploaded files for size, sanitized extension, and magic-byte signatures.
    Returns (is_valid: bool, error_message: Optional[str], ext: str).
    """
    if not file_obj:
        return False, "No file uploaded.", ""
    max_bytes = max_mb * 1024 * 1024
    size = getattr(file_obj, 'size', None)
    if size is not None and size > max_bytes:
        return False, f"File exceeds the maximum allowed size of {max_mb}MB.", ""

    raw_name = os.path.basename(getattr(file_obj, 'name', '') or '')
    cleaned_name = re.sub(r'[^A-Za-z0-9._-]', '_', raw_name)
    if not cleaned_name or '.' not in cleaned_name:
        return False, "Uploaded file must have a valid extension.", ""
    ext = cleaned_name.rsplit('.', 1)[-1].lower()
    if ext not in allowed_exts:
        return False, f"Unsupported file type '.{ext}'. Allowed types: {', '.join(allowed_exts)}.", ext

    try:
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        header = file_obj.read(2048) if hasattr(file_obj, 'read') else b''
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        if isinstance(header, str):
            header = header.encode('utf-8', errors='ignore')

        if ext == 'pdf' and not header.startswith(b'%PDF-'):
            return False, "File content does not match a valid PDF signature (%PDF-).", ext
        if ext == 'docx' and not header.startswith(b'PK\x03\x04'):
            return False, "File content does not match a valid DOCX archive signature.", ext
        if ext == 'txt':
            lower_hdr = header.lower()
            if b'<script' in lower_hdr or b'<!doctype html' in lower_hdr or b'<html' in lower_hdr:
                return False, "HTML/script payloads are not permitted in text uploads.", ext
        file_obj.name = cleaned_name
    except Exception:
        return False, "Unable to read uploaded file stream.", ext

    return True, None, ext

# ==============================================================================
# 1. TEXT CLEANING & NORMALIZATION ENGINE
# ==============================================================================

def clean_and_normalize_text(text: str) -> str:
    """
    Cleans raw text extracted from documents:
    - Eliminates NUL bytes (\x00) preventing PostgreSQL database corruption.
    - Decodes standard typographical ligatures (ﬁ, ﬂ, ﬀ, ﬃ, etc.).
    - Normalizes smart quotes, apostrophes, and em/en dashes.
    - Standardizes various unicode bullet symbols into uniform '• ' markers.
    - Resolves hyphenated line wraps (e.g. 'develo-\\npment' -> 'development').
    - Normalizes non-breaking spaces and collapses irregular whitespace.
    """
    if not text:
        return ""

    # 1. Strip NUL bytes (fatal for PostgreSQL)
    text = text.replace('\x00', '')

    # 2. Decompose Unicode typographic ligatures
    ligatures = {
        'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl',
        'ﬅ': 'ft', 'ﬆ': 'st', 'Æ': 'AE', 'æ': 'ae', 'Œ': 'OE', 'œ': 'oe'
    }
    for lig, rep in ligatures.items():
        text = text.replace(lig, rep)

    # 3. Normalize smart quotes, apostrophes, and typographical dashes
    text = re.sub(r'[\u2018\u2019\u201a\u201b\u02bc\u0060\u00b4]', "'", text)
    text = re.sub(r'[\u201c\u201d\u201e\u201f\u00ab\u00bb]', '"', text)
    text = re.sub(r'[\u2012\u2013\u2014\u2015\u2010\u2212]', '-', text)

    # 4. Standardize all bullet variants to '\n• '
    bullet_chars = r'[\u2022\u25cf\u25aa\u25b6\u25cb\u2219\u2023\u25c6\u2713\u2714\u2043\xb7\u25ba\u25fe\u27a4]'
    text = re.sub(bullet_chars, '\n• ', text)

    # 5. Normalize non-breaking, zero-width, and directional spaces
    text = re.sub(r'[\xa0\u200b\u200c\u200d\u200e\u200f\ufeff\u3000]', ' ', text)

    # 6. Normalize newlines
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # 7. Rejoin hyphenated line wraps (e.g. 'architec-\nture' -> 'architecture')
    # Exclude single characters and short technical acronyms like CI/CD
    text = re.sub(r'([A-Za-z]{2,})-\s*\n\s*([A-Za-z]{2,})', r'\1\2', text)

    # 8. Clean up spaces around bullets and collapse excessive whitespace
    text = re.sub(r'[ \t]*•[ \t]*', '\n• ', text)

    lines = []
    for line in text.split('\n'):
        cleaned = re.sub(r'[ \t]+', ' ', line).strip()
        lines.append(cleaned)

    normalized = '\n'.join(lines)
    # Collapse 3 or more consecutive newlines into 2
    normalized = re.sub(r'\n{3,}', '\n\n', normalized)

    return normalized.strip()


# ==============================================================================
# 2. FORMAT-SPECIFIC TEXT EXTRACTORS
# ==============================================================================

def _extract_from_pdf(raw_bytes: bytes) -> str:
    """
    Extracts text from PDF using pypdf.
    - Uses layout-aware extraction first to preserve multi-column formatting.
    - Falls back to plain text extraction.
    - Recovers hyperlink annotations (e.g. LinkedIn, GitHub profile links).
    - Extracts PDF form fields if present.
    """
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(raw_bytes))
        page_chunks = []
        hyperlinks = []

        for page in reader.pages:
            page_text = ""
            # 1. Attempt layout mode (preserves table & multi-column structure)
            try:
                page_text = page.extract_text(extraction_mode="layout") or ""
            except Exception:
                page_text = ""

            # 2. Fallback to plain extraction if layout is blank
            if not page_text.strip():
                try:
                    page_text = page.extract_text(extraction_mode="plain") or ""
                except Exception:
                    page_text = ""
            if not page_text.strip():
                try:
                    page_text = page.extract_text() or ""
                except Exception:
                    page_text = ""

            if page_text.strip():
                page_chunks.append(page_text)

            # 3. Extract Hyperlinks from Annotations (LinkedIn, GitHub, Portfolio)
            try:
                annots = page.get('/Annots')
                if annots:
                    for a in annots:
                        obj = a.get_object() if hasattr(a, 'get_object') else a
                        if isinstance(obj, dict):
                            action = obj.get('/A')
                            if action and hasattr(action, 'get_object'):
                                action = action.get_object()
                            if isinstance(action, dict):
                                uri = action.get('/URI')
                                if uri and isinstance(uri, str):
                                    if any(k in uri.lower() for k in ['linkedin.com', 'github.com', 'portfolio', 'http']):
                                        hyperlinks.append(uri)
            except Exception:
                pass

        # 4. Extract Form Fields
        try:
            form_fields = reader.get_form_text_fields()
            if form_fields:
                field_lines = [f"{k}: {v}" for k, v in form_fields.items() if v]
                if field_lines:
                    page_chunks.append("\n".join(field_lines))
        except Exception:
            pass

        if hyperlinks:
            page_chunks.append("\nHyperlinks: " + " | ".join(sorted(set(hyperlinks))))

        return "\n\n".join(page_chunks)
    except Exception as e:
        logger.warning(f"PDF extraction error: {e}")
        return ""


def _extract_from_docx(raw_bytes: bytes) -> str:
    """
    Extracts complete text from DOCX documents:
    - Extracts document headers & footers (where candidate name & contacts often reside).
    - Iterates body elements in natural order, handling both paragraphs AND tables.
    - Preserves bullet list item styling with '• '.
    - Extracts hyperlink relationship targets (LinkedIn, GitHub URLs).
    - Extracts text from XML text boxes and shapes.
    """
    try:
        import docx
        doc = docx.Document(io.BytesIO(raw_bytes))
        chunks = []

        # 1. Extract Header text (candidate contact bar is frequently placed here)
        for section in doc.sections:
            try:
                if section.header and not section.header.is_linked_to_previous:
                    for p in section.header.paragraphs:
                        if p.text.strip():
                            chunks.append(p.text.strip())
                    for t in section.header.tables:
                        for row in t.rows:
                            cells_text = [c.text.strip() for c in row.cells if c.text.strip()]
                            if cells_text:
                                chunks.append(" | ".join(cells_text))
            except Exception:
                pass

        # 2. Extract Document Body in natural element order
        for child in doc.element.body:
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            if tag == 'p':
                para = docx.text.paragraph.Paragraph(child, doc)
                text = para.text.strip()
                if text:
                    # Detect list/bullet formatting from styles
                    style_name = para.style.name.lower() if para.style and para.style.name else ""
                    if any(k in style_name for k in ['bullet', 'list']) and not text.startswith(('•', '-', '*')):
                        text = f"• {text}"
                    chunks.append(text)
            elif tag == 'tbl':
                table = docx.table.Table(child, doc)
                for row in table.rows:
                    row_cells = []
                    seen_cells = set()
                    for cell in row.cells:
                        if cell._tc not in seen_cells:
                            seen_cells.add(cell._tc)
                            cell_text = " ".join(p.text.strip() for p in cell.paragraphs if p.text.strip())
                            if cell_text:
                                row_cells.append(cell_text)
                    if row_cells:
                        chunks.append(" | ".join(row_cells))
            elif tag in ('txbxContent', 'pict', 'drawing'):
                try:
                    box_text = "".join(child.itertext()).strip()
                    if box_text:
                        chunks.append(box_text)
                except Exception:
                    pass

        # 3. Extract Embedded Hyperlinks
        try:
            for rel in doc.part.rels.values():
                if "hyperlink" in rel.reltype and rel.target_ref:
                    url = rel.target_ref
                    if any(k in url.lower() for k in ['linkedin.com', 'github.com', 'portfolio', 'http']):
                        chunks.append(url)
        except Exception:
            pass

        # 4. Extract Footers
        for section in doc.sections:
            try:
                if section.footer and not section.footer.is_linked_to_previous:
                    for p in section.footer.paragraphs:
                        if p.text.strip():
                            chunks.append(p.text.strip())
            except Exception:
                pass

        return "\n".join(chunks)
    except Exception as e:
        logger.warning(f"DOCX extraction fallback triggered: {e}")
        try:
            import docx
            doc = docx.Document(io.BytesIO(raw_bytes))
            p_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            t_text = "\n".join(" | ".join(c.text.strip() for c in r.cells) for t in doc.tables for r in t.rows)
            return f"{p_text}\n{t_text}"
        except Exception:
            return ""


def _extract_from_doc(raw_bytes: bytes) -> str:
    """
    Extracts text from legacy Word 97-2004 (.doc OLE2 format) or DOCX renamed as .doc.
    """
    # 1. If it starts with PK\x03\x04, it is actually a modern DOCX zip file
    if raw_bytes.startswith(b'PK\x03\x04'):
        return _extract_from_docx(raw_bytes)

    # 2. Extract ASCII and UTF-16LE printable strings from binary stream
    try:
        ascii_matches = re.findall(rb'[\x20-\x7e\t\n\r]{4,}', raw_bytes)
        text_ascii = " ".join(s.decode('latin-1', errors='ignore') for s in ascii_matches)

        utf16_matches = re.findall(rb'(?:[\x20-\x7e]\x00){4,}', raw_bytes)
        text_utf16 = " ".join(s.decode('utf-16-le', errors='ignore') for s in utf16_matches)

        combined = text_ascii if len(text_ascii) > len(text_utf16) else text_utf16
        noise_tokens = [
            'WordDocument', 'CompObj', 'ObjectPool', 'SummaryInformation',
            'DocumentSummaryInformation', 'Microsoft Word', 'Normal.dotm'
        ]
        for token in noise_tokens:
            combined = combined.replace(token, '')
        return combined
    except Exception:
        return ""


def _extract_from_rtf(raw_bytes: bytes) -> str:
    """Extracts text from Rich Text Format (.rtf) documents."""
    try:
        content = raw_bytes.decode('utf-8', errors='ignore')
        # Decode hex escapes
        content = re.sub(
            r"\\'[0-9a-fA-F]{2}",
            lambda m: bytes.fromhex(m.group(0)[2:]).decode('latin-1', errors='ignore'),
            content
        )
        # Strip control words
        content = re.sub(r'\\[a-zA-Z]+(-?\d+)? ?', ' ', content)
        # Strip braces
        content = re.sub(r'[{}]', '', content)
        return content
    except Exception:
        return ""


# ==============================================================================
# 3. UNIVERSAL FILE TEXT EXTRACTOR
# ==============================================================================

def extract_text_from_file(file_obj: Any) -> str:
    """
    Universally extracts high-fidelity, normalized text from:
    - PDF documents (.pdf)
    - Modern Word documents (.docx)
    - Legacy Word documents (.doc)
    - Rich Text Format documents (.rtf)
    - Plain text / Markdown (.txt, .md, .text)

    Accepts Django UploadedFile, FieldFile, file path (str/Path), file-like stream, or raw bytes.
    """
    if file_obj is None:
        return ""

    raw_bytes = b""
    filename = ""

    # 1. Normalize input into raw_bytes & filename
    if isinstance(file_obj, (str, Path)):
        filename = str(file_obj).lower()
        try:
            with open(file_obj, 'rb') as f:
                raw_bytes = f.read()
        except Exception as e:
            logger.error(f"Failed to read file path {file_obj}: {e}")
            return ""
    elif isinstance(file_obj, bytes):
        raw_bytes = file_obj
        filename = ""
    else:
        # Django UploadedFile, FieldFile, or standard io stream
        filename = getattr(file_obj, 'name', '') or ""
        filename = filename.lower()
        if hasattr(file_obj, 'seek'):
            try:
                file_obj.seek(0)
            except Exception:
                pass
        try:
            raw_bytes = file_obj.read()
        except Exception as e:
            logger.error(f"Failed reading stream {filename}: {e}")
            return ""
        if hasattr(file_obj, 'seek'):
            try:
                file_obj.seek(0)
            except Exception:
                pass

    if not raw_bytes:
        return ""

    # 2. Magic byte inspection & extension routing
    raw_content = ""
    if raw_bytes.startswith(b'%PDF') or filename.endswith('.pdf'):
        raw_content = _extract_from_pdf(raw_bytes)
    elif raw_bytes.startswith(b'PK\x03\x04') or filename.endswith('.docx'):
        raw_content = _extract_from_docx(raw_bytes)
    elif raw_bytes.startswith(b'\xd0\xcf\x11\xe0') or filename.endswith('.doc'):
        raw_content = _extract_from_doc(raw_bytes)
    elif raw_bytes.startswith(b'{\\rtf') or filename.endswith('.rtf'):
        raw_content = _extract_from_rtf(raw_bytes)
    else:
        # Plain text with multiple encoding fallbacks
        for encoding in ['utf-8', 'latin-1', 'cp1252', 'utf-16']:
            try:
                raw_content = raw_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if not raw_content:
            raw_content = raw_bytes.decode('utf-8', errors='ignore')

    # 3. Clean and normalize
    return clean_and_normalize_text(raw_content)


# ==============================================================================
# 4. COMPREHENSIVE SKILL TAXONOMY & CANONICAL ALIASES
# ==============================================================================

# Canonical Skill Taxonomy
SKILL_DB = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
    "Swift", "Kotlin", "SQL", "HTML", "CSS", "Shell", "Bash", "PowerShell", "R", "Dart",
    "Scala", "C", "Solidity", "GraphQL",
    # Frontend & Fullstack
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "Bootstrap",
    "Redux", "Zustand", "HTML5", "CSS3", "SASS", "SCSS", "Webpack", "Vite", "Babel",
    "jQuery", "Responsive Design", "Web Performance", "Jest", "Cypress",
    # Backend & Architecture
    "Django", "FastAPI", "Flask", "Node.js", "Express.js", "NestJS", "Spring Boot",
    "Ruby on Rails", "ASP.NET", ".NET", "Laravel", "Microservices", "REST API",
    "gRPC", "Kafka", "RabbitMQ", "Celery", "Event-Driven Architecture", "System Design",
    # Databases & Caching
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB",
    "SQLite", "Firebase", "Supabase", "Prisma", "TypeORM", "SQLAlchemy", "Vector DB",
    "Pinecone", "ChromaDB", "Milvus", "Neo4j",
    # Cloud, DevOps & Infrastructure
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins",
    "CI/CD", "GitHub Actions", "GitLab CI", "Linux", "Nginx", "Apache", "Prometheus",
    "Grafana", "Cloudflare", "Helm", "OpenShift",
    # Mobile
    "React Native", "Flutter", "SwiftUI", "Android SDK", "iOS SDK", "Expo",
    # AI, ML & Data Engineering
    "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision",
    "LLM", "Generative AI", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn",
    "LangChain", "LlamaIndex", "Hugging Face", "Tableau", "Power BI", "Apache Spark",
    "Airflow", "dbt", "Prompt Engineering", "Data Engineering", "Data Analysis",
    # Engineering Tools & Practices
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Figma", "Postman",
    "Swagger", "Unit Testing", "TDD", "Agile", "Scrum",
    # Soft & Management Skills
    "Leadership", "Communication", "Problem Solving", "Teamwork", "Time Management",
    "Critical Thinking", "Project Management", "Stakeholder Management", "Mentorship",
    "Collaboration"
]

# Canonical Aliases & Normalizations: alias -> Canonical Name
SKILL_ALIASES = {
    # React
    "reactjs": "React", "react.js": "React", "react": "React",
    # Node
    "nodejs": "Node.js", "node.js": "Node.js", "node": "Node.js",
    # Next
    "nextjs": "Next.js", "next.js": "Next.js", "next": "Next.js",
    # Vue
    "vuejs": "Vue.js", "vue.js": "Vue.js", "vue": "Vue.js",
    # Angular
    "angularjs": "Angular", "angular.js": "Angular", "angular": "Angular",
    # PostgreSQL
    "postgres": "PostgreSQL", "postgresql": "PostgreSQL",
    # Go
    "golang": "Go", "go lang": "Go",
    # AWS
    "amazon web services": "AWS", "aws": "AWS",
    # GCP
    "google cloud platform": "GCP", "google cloud": "GCP", "gcp": "GCP",
    # Azure
    "microsoft azure": "Azure", "azure": "Azure",
    # Kubernetes
    "k8s": "Kubernetes", "kubernetes": "Kubernetes",
    # Tailwind
    "tailwindcss": "Tailwind CSS", "tailwind": "Tailwind CSS", "tailwind css": "Tailwind CSS",
    # TypeScript & JavaScript
    "typescript": "TypeScript", "ts": "TypeScript",
    "javascript": "JavaScript", "js": "JavaScript",
    # Python
    "python": "Python", "python3": "Python",
    # AI / ML
    "machine learning": "Machine Learning", "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "natural language processing": "Natural Language Processing", "nlp": "Natural Language Processing",
    "artificial intelligence": "AI", "ai": "AI",
    "large language models": "LLM", "llms": "LLM", "llm": "LLM",
    # CI/CD
    "ci/cd": "CI/CD", "ci cd": "CI/CD", "continuous integration": "CI/CD", "continuous deployment": "CI/CD",
    # APIs
    "rest api": "REST API", "restful api": "REST API", "rest apis": "REST API", "restful apis": "REST API",
    # .NET
    "dotnet": ".NET", ".net": ".NET", ".net core": ".NET", "asp.net": "ASP.NET", "asp.net core": "ASP.NET",
    # Databases
    "mongodb": "MongoDB", "mongo": "MongoDB",
    "scikit-learn": "Scikit-Learn", "sklearn": "Scikit-Learn",
    "docker compose": "Docker Compose", "github actions": "GitHub Actions",
    "fast api": "FastAPI", "fastapi": "FastAPI",
    "spring boot": "Spring Boot", "springboot": "Spring Boot",
    "express": "Express.js", "expressjs": "Express.js", "express.js": "Express.js"
}


# ==============================================================================
# 5. HIGH-ACCURACY SKILL EXTRACTION ENGINE
# ==============================================================================

def extract_skills_from_text(text: str) -> List[str]:
    """
    Accurately extracts technical and domain skills from resume or job text.
    - Prevents false-positives for short tokens ('Go', 'R', 'C', 'AI', 'ML', 'SQL').
    - Canonicalizes variants (e.g. 'ReactJS' -> 'React', 'Golang' -> 'Go').
    - Uses section-targeted parsing to extract tools listed under 'Skills' headers.
    """
    if not text:
        return []

    found_skills = set()
    text_lower = f" {text.lower()} "

    # 1. Match from canonical SKILL_DB
    for skill in SKILL_DB:
        skill_lower = skill.lower()

        # Handle ambiguous short words with strict context
        if skill_lower == "go":
            # Match 'golang' or 'go' when in language/tech context
            if re.search(r'\bgolang\b', text_lower) or re.search(r'(?:python|typescript|rust|java|c\+\+|docker|backend|engineer)\s*[/,]\s*go\b|\bgo\s*[/,]\s*(?:python|typescript|rust|backend)', text_lower):
                found_skills.add("Go")
            continue
        elif skill_lower == "r":
            # Match 'R' only in skills lists e.g., 'Python, R, SQL' or 'R programming'
            if re.search(r'(?:python|sql|sas|matlab|pandas)\s*,\s*r\b|\br\s*,\s*(?:python|sql|sas)|\br\s+programming\b|\br\s+language\b', text_lower):
                found_skills.add("R")
            continue
        elif skill_lower == "c":
            # Match 'C' only in 'C/C++' or 'C programming'
            if re.search(r'\bc/c\+\+|\bc\s+programming|\bc\s+language\b', text_lower):
                found_skills.add("C")
            continue
        elif skill_lower == "c++":
            if re.search(r'(?<![A-Za-z0-9])c\+\+(?![A-Za-z0-9\+])', text_lower):
                found_skills.add("C++")
            continue
        elif skill_lower == "c#":
            if re.search(r'(?<![A-Za-z0-9])c#(?![A-Za-z0-9#])|\bc-sharp\b', text_lower):
                found_skills.add("C#")
            continue
        elif skill_lower == ".net":
            if re.search(r'(?<![A-Za-z0-9])\.net\b|\bdotnet\b', text_lower):
                found_skills.add(".NET")
            continue
        elif skill_lower in ("ai", "ml", "nlp", "sql", "aws", "gcp", "ts", "js"):
            # Ensure proper word boundaries
            pattern = rf'(?<![a-zA-Z0-9]){re.escape(skill_lower)}(?![a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                found_skills.add(SKILL_ALIASES.get(skill_lower, skill))
            continue

        # Standard boundary-checked skill matching
        escaped = re.escape(skill_lower)
        pattern = rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            found_skills.add(skill)

    # 2. Check aliases
    for alias, canonical in SKILL_ALIASES.items():
        if alias in ("go", "r", "c", "ai", "ml", "nlp", "sql", "aws", "gcp", "ts", "js"):
            continue
        pattern = rf'(?<![a-zA-Z0-9]){re.escape(alias)}(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            found_skills.add(canonical)

    # 3. Section-Targeted Skill Extraction
    # Look for explicitly labeled Technical Skills sections
    skills_sec = re.search(
        r'(?:technical\s+skills|skills\s*&?\s*technologies|core\s+competencies|technologies|skills)\s*[:\n](.*?)(?:\n\s*(?:professional\s+experience|work\s+experience|employment|experience|education|projects|certifications|achievements)\b|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if skills_sec:
        section_text = skills_sec.group(1)[:1500]
        # Split by comma, bullet, pipe, or newline
        tokens = re.split(r'[,|•\n/]+', section_text)
        for token in tokens:
            cleaned = token.strip()
            # Remove category prefixes like 'Languages:', 'Frameworks:'
            if ':' in cleaned:
                cleaned = cleaned.split(':', 1)[-1].strip()
            if not cleaned or len(cleaned) < 2 or len(cleaned) > 30:
                continue
            lower_clean = cleaned.lower()
            if lower_clean in SKILL_ALIASES:
                found_skills.add(SKILL_ALIASES[lower_clean])
            else:
                for skill in SKILL_DB:
                    if skill.lower() == lower_clean:
                        found_skills.add(skill)
                        break

    return sorted(list(found_skills))


# ==============================================================================
# 6. STRUCTURED RESUME PARSER (CONTACTS, EXPERIENCE, EDUCATION)
# ==============================================================================

def extract_resume_details(text: str) -> Dict[str, Any]:
    """
    Deeply parses resume text to extract structured candidate intelligence:
    - Personal Details: Candidate Name, Email, Phone, Location, LinkedIn, GitHub, Portfolio.
    - Summary / Objective.
    - Skills (canonicalized).
    - Experience records with Company, Role, Duration, and Impact Bullets.
    - Education records with Institution, Degree, Graduation Year, GPA.
    - Projects & Certifications.
    - Multi-factor ATS Readiness Score & Metrics.
    """
    if not text:
        return _empty_resume_profile()

    # 1. Contact / Personal Details Extraction
    personal: Dict[str, str] = {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "portfolio": ""
    }

    # Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', text)
    if email_match:
        personal["email"] = email_match.group(0).strip()

    # Phone
    phone_match = re.search(r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b', text)
    if phone_match:
        personal["phone"] = phone_match.group(0).strip()

    # LinkedIn
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([A-Za-z0-9_-]+)', text, re.IGNORECASE)
    if linkedin_match:
        personal["linkedin"] = f"https://linkedin.com/in/{linkedin_match.group(1)}"

    # GitHub
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)', text, re.IGNORECASE)
    if github_match:
        username = github_match.group(1)
        if username.lower() not in ('trending', 'features', 'topics', 'pricing'):
            personal["github"] = f"https://github.com/{username}"

    # Portfolio / Personal Website
    portfolio_match = re.search(
        r'(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|me|io|portfolio|tech|app|info))\b',
        text, re.IGNORECASE
    )
    if portfolio_match:
        personal["portfolio"] = f"https://{portfolio_match.group(1)}"

    # Location (City, State / Country)
    location_match = re.search(
        r'\b([A-Z][a-zA-Z\s]{2,20},\s*(?:[A-Z]{2}|India|USA|UK|Canada|Germany|Singapore|Australia|Remote))\b',
        text
    )
    if location_match:
        personal["location"] = location_match.group(1).strip()

    # Name extraction (Inspect first 6 lines)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:6]:
        # Filter out lines containing contact info or header words
        if any(c in line for c in ('@', 'http', 'www.', ':', '•', '|', '/')):
            continue
        if re.search(r'\b(?:resume|curriculum|vitae|page|profile|summary|contact|phone)\b', line, re.IGNORECASE):
            continue
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isalpha() for w in words):
            personal["name"] = line
            break

    # 2. Extract Professional Summary
    summary = ""
    summary_match = re.search(
        r'(?:summary|professional\s+summary|profile|about\s+me|career\s+objective)\s*[:\n](.*?)(?:\n\s*(?:technical\s+skills|skills|work\s+experience|experience|education|projects)\b|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if summary_match:
        summary_raw = summary_match.group(1).strip()
        # Keep first coherent paragraph
        paragraphs = [p.strip() for p in summary_raw.split('\n\n') if p.strip()]
        if paragraphs:
            summary = paragraphs[0][:600]

    # 3. Extract Skills
    skills = extract_skills_from_text(text)

    # 4. Extract Work Experience
    experience: List[Dict[str, Any]] = []
    exp_match = re.search(
        r'(?:professional\s+experience|work\s+experience|employment\s+history|experience)\s*[:\n](.*?)(?:\n\s*(?:education|academic|projects|certifications|achievements|skills)\b|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if exp_match:
        exp_block = exp_match.group(1).strip()
        exp_lines = [l.strip() for l in exp_block.split('\n') if l.strip()]
        current_job: Dict[str, Any] = {"company": "", "role": "", "duration": "", "bullets": []}

        date_pattern = r'\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|to)\s*(?:present|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4})\b'

        for l in exp_lines:
            if l.startswith('•') or l.startswith('-'):
                bullet = l.lstrip('•-* ').strip()
                if bullet:
                    current_job["bullets"].append(bullet)
            else:
                # Check if this line looks like a job header (Company | Role | Date)
                has_date = bool(re.search(date_pattern, l, re.IGNORECASE))
                has_separator = '|' in l or '–' in l or '-' in l

                if has_date or has_separator or len(l.split()) <= 6:
                    if current_job["company"] or current_job["role"] or current_job["bullets"]:
                        if not current_job["bullets"]:
                            current_job["bullets"] = ["Executed core engineering responsibilities."]
                        experience.append(current_job)
                        current_job = {"company": "", "role": "", "duration": "", "bullets": []}

                    # Parse company and role from header
                    parts = [p.strip() for p in re.split(r'[|–—]', l) if p.strip()]
                    if len(parts) >= 3:
                        current_job["role"] = parts[0]
                        current_job["company"] = parts[1]
                        current_job["duration"] = parts[2]
                    elif len(parts) == 2:
                        current_job["role"] = parts[0]
                        current_job["company"] = parts[1]
                    else:
                        date_m = re.search(date_pattern, l, re.IGNORECASE)
                        if date_m:
                            current_job["duration"] = date_m.group(0)
                            current_job["role"] = l[:date_m.start()].strip(' |-')
                        else:
                            current_job["role"] = l

        if current_job["company"] or current_job["role"] or current_job["bullets"]:
            if not current_job["bullets"]:
                current_job["bullets"] = ["Engineered and delivered core platform capabilities."]
            experience.append(current_job)

    # 5. Extract Education
    education: List[Dict[str, Any]] = []
    edu_match = re.search(
        r'(?:education|academic\s+background|qualifications)\s*[:\n](.*?)(?:\n\s*(?:projects|certifications|achievements|skills|experience)\b|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if edu_match:
        edu_block = edu_match.group(1).strip()
        edu_lines = [l.strip() for l in edu_block.split('\n') if l.strip()]
        for l in edu_lines:
            degree_m = re.search(r'\b(?:Bachelor|Master|B\.S\.|M\.S\.|B\.Tech|M\.Tech|Ph\.D|Associate|Diploma)\b[^\n|]*', l, re.IGNORECASE)
            year_m = re.search(r'\b(?:19|20)\d{2}\b', l)
            gpa_m = re.search(r'\b(?:GPA|CGPA)[:\s]*([0-9.]+)\b', l, re.IGNORECASE)

            if degree_m or year_m or 'university' in l.lower() or 'college' in l.lower() or 'institute' in l.lower():
                parts = [p.strip() for p in re.split(r'[|–—]', l) if p.strip()]
                institution = parts[0] if parts else l
                degree = degree_m.group(0).strip() if degree_m else (parts[1] if len(parts) > 1 else "Bachelor of Science")
                year = year_m.group(0) if year_m else ""
                gpa = gpa_m.group(1) if gpa_m else ""
                education.append({
                    "institution": institution,
                    "degree": degree,
                    "year": year,
                    "gpa": gpa
                })

    # 6. Extract Projects
    projects: List[Dict[str, Any]] = []
    proj_match = re.search(
        r'(?:projects|key\s+projects|personal\s+projects)\s*[:\n](.*?)(?:\n\s*(?:certifications|achievements|education|skills|experience)\b|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if proj_match:
        proj_block = proj_match.group(1).strip()
        proj_lines = [l.strip() for l in proj_block.split('\n') if l.strip()]
        current_proj: Dict[str, str] = {"name": "", "description": "", "tech": ""}
        for l in proj_lines:
            if l.startswith('•') or l.startswith('-'):
                bullet = l.lstrip('•-* ').strip()
                if current_proj["description"]:
                    current_proj["description"] += f" {bullet}"
                else:
                    current_proj["description"] = bullet
            else:
                if current_proj["name"]:
                    projects.append(current_proj)
                    current_proj = {"name": "", "description": "", "tech": ""}
                parts = [p.strip() for p in re.split(r'[|–—]', l) if p.strip()]
                current_proj["name"] = parts[0]
                if len(parts) > 1:
                    current_proj["tech"] = parts[1]
        if current_proj["name"]:
            projects.append(current_proj)

    # 7. Extract Certifications
    certifications: List[Dict[str, str]] = []
    cert_match = re.search(
        r'(?:certifications|certificates|licenses)\s*[:\n](.*?)(?:\n\s*(?:achievements|projects|education|skills)\b|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if cert_match:
        cert_block = cert_match.group(1).strip()
        for l in cert_block.split('\n'):
            cleaned = l.lstrip('•-* ').strip()
            if cleaned:
                certifications.append({"name": cleaned, "issuer": "", "year": ""})

    # 8. Compute ATS Score & System Metrics
    ats_score = calculate_ats_score(text, skills)

    # Count quantified metrics (bullets with %, numbers, scale)
    quantified_count = len(re.findall(r'\b\d+(?:%|\+|x|\s*k|\s*m)?\b', text))

    return {
        "personal": personal,
        "summary": summary,
        "skills": skills,
        "experience": experience,
        "education": education,
        "projects": projects,
        "certifications": certifications,
        "achievements": [],
        "metrics": {
            "ats_score": ats_score,
            "word_count": len(text.split()),
            "character_count": len(text),
            "skill_count": len(skills),
            "quantified_metrics_count": quantified_count
        }
    }


def _empty_resume_profile() -> Dict[str, Any]:
    return {
        "personal": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""},
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "achievements": [],
        "metrics": {"ats_score": 0.0, "word_count": 0, "character_count": 0, "skill_count": 0, "quantified_metrics_count": 0}
    }


# ==============================================================================
# 7. ATS READINESS & BENCHMARK SCORING
# ==============================================================================

def calculate_ats_score(text: str, skills: Optional[List[str]] = None) -> float:
    """
    Computes an objective, multi-axis ATS compliance score (0-100):
    - Contact Info Completeness (20 pts): Name, Email, Phone, LinkedIn/GitHub
    - Core Sections Presence (25 pts): Experience, Education, Skills, Summary, Projects
    - Technical Depth (25 pts): Density & diversity of canonical skills
    - Action Verbs (15 pts): Active engineering verbs starting bullet points
    - Impact Quantification (15 pts): Numerical metrics (%, $, scale, latency)
    """
    if not text:
        return 0.0

    text_lower = text.lower()
    score = 0.0

    # 1. Contact Info (20 pts)
    if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', text):
        score += 7.0
    if re.search(r'(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', text):
        score += 5.0
    if 'linkedin.com' in text_lower or 'github.com' in text_lower:
        score += 5.0
    # Name present at start
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if lines and len(lines[0].split()) >= 2 and '@' not in lines[0]:
        score += 3.0

    # 2. Essential Sections (25 pts)
    sections = {
        'experience': 8.0,
        'education': 6.0,
        'skills': 6.0,
        'projects': 3.0,
        'summary': 2.0
    }
    for sec, pts in sections.items():
        if sec in text_lower:
            score += pts

    # 3. Technical Skills Density (25 pts)
    if skills is None:
        skills = extract_skills_from_text(text)
    skill_count = len(skills)
    if skill_count >= 15:
        score += 25.0
    elif skill_count >= 10:
        score += 20.0
    elif skill_count >= 6:
        score += 15.0
    elif skill_count >= 3:
        score += 10.0
    elif skill_count >= 1:
        score += 5.0

    # 4. Action Verbs (15 pts)
    action_verbs = [
        'engineered', 'developed', 'architected', 'led', 'built', 'implemented',
        'optimized', 'designed', 'spearheaded', 'automated', 'delivered', 'orchestrated',
        'created', 'deployed', 'scaled', 'reduced', 'accelerated', 'transformed'
    ]
    verb_matches = sum(1 for v in action_verbs if re.search(rf'\b{v}\b', text_lower))
    score += min(15.0, verb_matches * 2.5)

    # 5. Quantified Impact (15 pts)
    # Check for %, $, multiplier (3x), or numbers
    metrics_count = len(re.findall(r'\b\d+(?:%|\+|x|\s*k|\s*m)?\b', text))
    if metrics_count >= 6:
        score += 15.0
    elif metrics_count >= 3:
        score += 10.0
    elif metrics_count >= 1:
        score += 5.0

    return min(100.0, round(score, 1))


# ==============================================================================
# 8. ROADMAP & SKILL GAP ANALYSIS
# ==============================================================================

def calculate_match_score(resume_text: str, required_skills_list: List[str]) -> float:
    """
    Calculates similarity between resume text and role required skills.
    Returns 0.0 - 100.0.
    """
    if not resume_text or not required_skills_list:
        return 0.0

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        required_text = " ".join(required_skills_list)
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([resume_text, required_text])
        similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(similarity) * 100, 1)
    except Exception:
        # High-accuracy token fallback
        resume_skills = set(s.lower() for s in extract_skills_from_text(resume_text))
        req_skills = set(s.lower() for s in required_skills_list)
        if not req_skills:
            return 70.0
        matched = resume_skills.intersection(req_skills)
        return round((len(matched) / len(req_skills)) * 100, 1)


def generate_roadmap(missing_skills: List[Any]) -> List[Dict[str, Any]]:
    """
    Prioritizes missing skills into a structured learning path across 3 phases.
    """
    if not missing_skills:
        return []

    phases = [
        {"name": "Phase 1: Foundation", "skills": []},
        {"name": "Phase 2: Core Competencies", "skills": []},
        {"name": "Phase 3: Specialized Tools", "skills": []}
    ]

    for i, skill in enumerate(missing_skills):
        skill_name = skill['name'] if isinstance(skill, dict) else skill
        if i < 2:
            phases[0]["skills"].append(skill_name)
        elif i < 5:
            phases[1]["skills"].append(skill_name)
        else:
            phases[2]["skills"].append(skill_name)

    return [p for p in phases if p["skills"]]


def analyze_skills(skill_data: List[Any]) -> Dict[str, Any]:
    """Analyzes a list of skills and returns core metrics."""
    if not skill_data:
        return {"score": 0, "status": "No skills provided"}

    return {
        "score": len(skill_data) * 10,
        "count": len(skill_data),
        "status": "Analyzed successfully"
    }