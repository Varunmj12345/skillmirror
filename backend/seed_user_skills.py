import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
django.setup()

from apps.users.models import User
from apps.skills.models import Skill, UserSkill

def seed_user_skills(email):
    u = User.objects.filter(email=email).first()
    if not u:
        print("User not found.")
        return

    # Standard Frontend Skills
    skill_names = ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'JavaScript', 'Git']
    
    for name in skill_names:
        skill, _ = Skill.objects.get_or_create(name=name)
        us, created = UserSkill.objects.get_or_create(user=u, skill=skill)
        if created:
            us.level = 4
            us.progress_percentage = 80
            us.category = 'technical'
            us.save()
            print(f"Added skill {name} to {email}")
        else:
            print(f"User already has skill {name}")

if __name__ == "__main__":
    seed_user_skills('varunmj1356@gmail.com')
