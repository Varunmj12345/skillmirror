import os
import sys
from django.apps import AppConfig

class JobsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.jobs'

    def ready(self):
        # Start periodic scout agent scheduler when running the web application
        is_server = any(arg in sys.argv for arg in ['runserver', 'gunicorn']) or os.environ.get('RUN_MAIN') == 'true'
        is_migration = any(arg in sys.argv for arg in ['makemigrations', 'migrate', 'collectstatic'])
        if is_server and not is_migration:
            try:
                from .services.career_scout_agent import OfficialCareerScoutAgent
                OfficialCareerScoutAgent.start_background_scheduler(interval_minutes=60)
            except Exception:
                pass
