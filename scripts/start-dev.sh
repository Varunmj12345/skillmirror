#!/bin/bash

# Navigate to the backend directory and start the Django development server
cd backend
source .env
python manage.py runserver &

# Navigate to the frontend directory and start the Next.js development server
cd ../frontend
npm install
npm run dev &

# Wait for both servers to start
wait