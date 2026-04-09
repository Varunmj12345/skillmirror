from django.db import migrations


def seed_skills(apps, schema_editor):
    Skill = apps.get_model('skills', 'Skill')
    skills = [
        'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'HTML/CSS',
        'Machine Learning', 'Data Visualization', 'TypeScript', 'Git',
        'AWS', 'Docker', 'REST APIs', 'Problem Solving', 'Communication',
    ]
    for name in skills:
        Skill.objects.get_or_create(name=name, defaults={'description': ''})


class Migration(migrations.Migration):
    dependencies = [('skills', '0001_initial')]
    operations = [migrations.RunPython(seed_skills, migrations.RunPython.noop)]
