#!/bin/bash

# Navigate to the backend directory
cd backend

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Print a success message
echo "Database migrations and static files collection completed successfully."