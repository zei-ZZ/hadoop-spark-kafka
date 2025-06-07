FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
