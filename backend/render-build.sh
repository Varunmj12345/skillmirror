#!/usr/bin/env bash
# exit on error
set -o errexit

# Identify target directory (backend)
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations to ensure database is in sync with Neon
python manage.py migrate

# Collect static files for WhiteNoise (Fixes Admin Styling)
python manage.py collectstatic --noinput
