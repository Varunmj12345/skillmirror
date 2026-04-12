#!/usr/bin/env bash
# exit on error
set -o errexit

# Check if we are in the project root or already inside the backend folder
if [ -d "backend" ]; then
  echo "Detected backend directory, entering..."
  cd backend
fi

# Install dependencies
pip install -r requirements.txt

# Run migrations to ensure database is in sync with Neon
python manage.py migrate

# Collect static files for WhiteNoise (Fixes Admin Styling)
python manage.py collectstatic --noinput
