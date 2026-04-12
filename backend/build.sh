#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting build process from backend root..."

# Ensure pip is up to date
python -m pip install --upgrade pip

# Install dependencies from requirements.txt
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Collect static files for WhiteNoise (Fixes Admin Styling)
python manage.py collectstatic --noinput

echo "Build complete!"
