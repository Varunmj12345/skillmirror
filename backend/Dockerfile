FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Create non-root application user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY --chown=appuser:appgroup . .

USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application (Gunicorn for production)
CMD ["gunicorn", "skillmirror.wsgi:application", "--config", "gunicorn.conf.py"]