#!/bin/bash

PORT=${1:-8080}

# Check if conda is installed
if ! command -v conda &> /dev/null; then
  echo "conda not found. Please install Miniconda or Anaconda."
  exit 1
fi

# Create and activate polariz_env if it does not exist
if ! conda info --envs | grep -q 'polariz_env'; then
  echo "Creating conda environment 'polariz_env'..."
  conda create --yes -n polariz_env python=3.10
else
  echo "Using existing conda environment 'polariz_env'."
fi

# Activate conda (ensure 'conda' commands in scripts work)
eval "$(conda shell.bash hook)"
conda activate polariz_env

# Kill process running on the given port
if lsof -i :$PORT -t >/dev/null; then
  echo "Port $PORT is currently in use. Killing existing processes..."
  lsof -i :$PORT -t | xargs kill -9
else
  echo "Port $PORT is free."
fi

# Always serve from project root
PROJECT_ROOT="$(dirname "$(dirname "$0")")"
cd "$PROJECT_ROOT"

# React app detection
if [ -f "package.json" ]; then
  if grep -q 'react' package.json; then
    echo "React detected. Installing node dependencies and starting dev server..."
    if ! command -v npm &> /dev/null; then
      echo "npm not found. Please install Node.js and npm."
      exit 1
    fi
    npm install

    # Detect yarn or npm run capability
    if grep -q '"start"' package.json && npm run | grep -q 'start'; then
      echo "Running: PORT=$PORT npm start"
      PORT=$PORT npm start
      exit $?
    elif grep -q '"dev"' package.json && npm run | grep -q 'dev'; then
      echo "No 'start' script, but 'dev' script found. Running: PORT=$PORT npm run dev"
      PORT=$PORT npm run dev
      exit $?
    else
      echo "Error: No 'start' or 'dev' script found in package.json."
      exit 1
    fi
  fi
fi

echo "No React project detected. Serving as static files from $PROJECT_ROOT..."
python -m http.server $PORT
