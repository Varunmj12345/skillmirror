from django.core.wsgi import get_wsgi_application
import os

from dotenv import load_dotenv
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')

application = get_wsgi_application()