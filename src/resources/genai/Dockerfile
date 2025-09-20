# Use Python 3.12 slim as base image
FROM python:3.12-slim AS base

# Update package lists and install Git
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*
    
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy pyproject.toml into the image
COPY pyproject.toml /app/pyproject.toml
COPY README.md /app/README.md

# Install dependencies and generate uv.lock
RUN uv sync --no-dev

# Copy the project into the image
COPY . /app


# Run the server
CMD ["uv", "run", "python", "app/server.py"]