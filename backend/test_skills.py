import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
django.setup()

from apps.users.models import User
from apps.skills.models import Skill, UserSkill

try:
    u = User.objects.first()
    if u:
        print('User Skills attribute type:', type(u.skills))
        print('Is it a descriptor?', hasattr(u.skills, 'all'))
        
        # Test finding where 'skills' comes from
        print('Dir of User:', dir(User))
except Exception as e:
    print('Error:', e)
