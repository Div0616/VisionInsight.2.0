#!/bin/bash
set -e

echo "=== VisionInsight Backend Startup ==="
echo "Venv python: /app/venv/bin/python"

# Create required directories (uploads/ and processed/)
/app/venv/bin/python startup.py

echo "Starting uvicorn on port $PORT..."
/app/venv/bin/uvicorn main:app --host 0.0.0.0 --port $PORT