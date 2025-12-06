
# pyHealth skin cancer classification pipeline
# This is a sample inference pipeline using pyHealth and MCP.

FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server.py .

# Create model directory
RUN mkdir /model

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the server
CMD ["python", "server.py"]
