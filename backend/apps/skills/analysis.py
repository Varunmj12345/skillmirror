import re
import io
import pypdf
import docx

def extract_text_from_file(file_obj):
    """
    Extracts text from PDF, DOCX, or TXT files.
    """
    content = ""
    filename = file_obj.name.lower()
    
    try:
        if filename.endswith('.pdf'):
            reader = pypdf.PdfReader(file_obj)
            for page in reader.pages:
                content += page.extract_text() + "\n"
        elif filename.endswith('.docx'):
            doc = docx.Document(file_obj)
            for para in doc.paragraphs:
                content += para.text + "\n"
        else:
            # Assume plain text
            content = file_obj.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        
    return content

# Common technical and soft skills for extraction matching
SKILL_DB = [
    # Programming Languages
    "Python", "JavaScript", "JS", "TypeScript", "TS", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Golang", "Rust", "Scala", "Dart", "Objective-C", "R", "Shell", "PowerShell",
    # Frontend
    "React", "React.js", "ReactJS", "Next.js", "NextJS", "Vue.js", "VueJS", "Vue", "Angular", "AngularJS", "Svelte", "HTML", "HTML5", "CSS", "CSS3", "Tailwind CSS", "TailwindCSS", "Bootstrap", "SASS", "SCSS", "LESS", "Redux", "Zustand", "Vuex", "GraphQL", "Apollo", "jQuery", "Web Performance", "Responsive Design",
    # Backend & Frameworks
    "Django", "Flask", "FastAPI", "Node.js", "NodeJS", "Express.js", "Express", "Spring Boot", "Spring", "Laravel", "Ruby on Rails", "Rails", "ASP.NET", "Dotnet", "NestJS", "Fastify", "Koa",
    # Databases
    "SQL", "PostgreSQL", "Postgres", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "SQLite", "Oracle", "MariaDB", "Firebase", "Firestore", "Prisma", "TypeORM", "Sequelize",
    # DevOps & Cloud
    "Docker", "Kubernetes", "K8s", "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Terraform", "Ansible", "Jenkins", "CI/CD", "CircleCI", "GitHub Actions", "Linux", "Nginx", "Apache", "Prometheus", "Grafana", "Cloudflare",
    # Mobile
    "React Native", "Flutter", "Ionic", "SwiftUI", "Android SDK", "iOS SDK", "Expo",
    # AI & Data
    "Machine Learning", "ML", "AI", "Artificial Intelligence", "Deep Learning", "Data Analysis", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "NLP", "Natural Language Processing", "Computer Vision", "Tableau", "Power BI", "Data Engineering",
    # Tools & Other
    "Git", "GitHub", "Bitbucket", "GitLab", "Jira", "Confluence", "Figma", "Adobe XD", "Unity", "Unreal Engine", "WebGL", "REST API", "Microservices", "System Design", "Unit Testing", "Jest", "Cypress", "Selenium", "Babel", "Webpack", "Vite",
    # Soft Skills
    "Communication", "Leadership", "Problem Solving", "Agile", "Scrum", "Teamwork", "Time Management", "Critical Thinking", "Project Management", "Stakeholder Management", "Mentorship"
]

def extract_skills_from_text(text):
    """
    Extracts skills from text using regex and a predefined skill list.
    """
    if not text:
        return []
        
    extracted = []
    text_lower = text.lower()
    
    for skill in SKILL_DB:
        # Match as whole word to avoid sub-word matches (e.g. "go" in "google")
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            extracted.append(skill)
            
    return sorted(list(set(extracted)))

def calculate_match_score(resume_text, required_skills_list):
    """
    Calculates a similarity score between resume text and a role's required skills.
    Returns a score from 0-100.
    """
    if not resume_text or not required_skills_list:
        return 0.0
        
    required_text = " ".join(required_skills_list)
    
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([resume_text, required_text])
        similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(similarity) * 100, 1)
    except Exception as e:
        print(f"Match score error: {e}")
        return 0.0

def generate_roadmap(missing_skills):
    """
    Prioritizes missing skills into a structured learning path (Phases).
    """
    if not missing_skills:
        return []
        
    # Simplified categorization for phases
    # In a real app, this would use importance weights
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


def analyze_skills(skill_data):
    """
    Analyzes a list of skills and returns basic metrics.
    """
    if not skill_data:
        return {"score": 0, "status": "No skills provided"}

    return {
        "score": len(skill_data) * 10,  # Mock logic
        "count": len(skill_data),
        "status": "Analyzed successfully"
    }