#!/bin/bash
echo "Python path: $(which python3)"
echo "Venv python: /app/venv/bin/python"
echo "Starting uvicorn..."
/app/venv/bin/uvicorn main:app --host 0.0.0.0 --port $PORT