FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling python extensions or image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["python", "app/main.py"]
