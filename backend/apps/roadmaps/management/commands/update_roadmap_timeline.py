from django.core.management.base import BaseCommand
from apps.roadmaps.models import RoadmapStep

class Command(BaseCommand):
    help = 'Update existing roadmap steps with default timeline values'

    def handle(self, *args, **options):
        steps = RoadmapStep.objects.filter(duration_weeks__isnull=True) | RoadmapStep.objects.filter(estimated_hours__isnull=True)
        
        updated_count = 0
        for step in steps:
            if not step.duration_weeks:
                step.duration_weeks = 2
            if not step.estimated_hours:
                step.estimated_hours = 20
            if not step.recommended_resources or len(step.recommended_resources) == 0:
                # Add default resources based on skills
                step.recommended_resources = [
                    {"type": "course", "name": f"Learn {step.title}", "platform": "Online Learning"},
                    {"type": "tutorial", "name": f"{step.title} Tutorial", "url": "https://example.com"}
                ]
            step.save()
            updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} roadmap steps with timeline data'))
