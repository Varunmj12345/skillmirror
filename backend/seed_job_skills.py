import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
django.setup()

from apps.jobs.models import JobData

def seed_skills():
    roles = {
        'Frontend Developer': ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux'],
        'Backend Developer': ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
        'DevOps Engineer': ['AWS', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
        'Senior Frontend Architect': ['React', 'TypeScript', 'System Design', 'Next.js', 'GraphQL'],
        'Senior Full Stack Engineer': ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker']
    }
    
    for role, skills in roles.items():
        jd, created = JobData.objects.get_or_create(role_name=role)
        jd.top_required_skills = skills
        jd.save()
        print(f"Updated {role} with {len(skills)} skills.")

if __name__ == "__main__":
    seed_skills()
