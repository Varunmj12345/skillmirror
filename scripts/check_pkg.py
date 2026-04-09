
import sys
import os

print(f"Python: {sys.executable}")
try:
    import pkg_resources
    print("pkg_resources ok")
except ImportError as e:
    print(f"pkg_resources failed: {e}")

try:
    import rest_framework_simplejwt
    print("simplejwt ok")
except ImportError as e:
    print(f"simplejwt failed: {e}")

try:
    import django
    print(f"django ok: {django.get_version()}")
except ImportError as e:
    print(f"django failed: {e}")
