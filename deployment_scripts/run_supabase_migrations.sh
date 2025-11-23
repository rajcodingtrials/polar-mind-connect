#!/bin/bash

# Script to run Supabase migrations
# Usage: ./run_supabase_migrations.sh
# This script will activate the polariz_env conda environment, install dependencies,
# and run supabase migration up

# Before running the script, authenticate with Supabase using the command:
# supabase login


# Get the project root directory
PROJECT_ROOT="$(dirname "$(dirname "$0")")"
cd "$PROJECT_ROOT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Running Supabase Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if conda is installed
if ! command -v conda &> /dev/null; then
  echo "❌ conda not found. Please install Miniconda or Anaconda."
  exit 1
fi

# Create and activate polariz_env if it does not exist
if ! conda info --envs | grep -q 'polariz_env'; then
  echo "Creating conda environment 'polariz_env'..."
  conda create --yes -n polariz_env python=3.10
else
  echo "✅ Using existing conda environment 'polariz_env'."
fi

# Activate conda (ensure 'conda' commands in scripts work)
eval "$(conda shell.bash hook)"
conda activate polariz_env

echo "✅ Conda environment activated"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "⚠️  Supabase CLI not found. Installing via npm..."
  
  # Check if npm is installed
  if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js and npm."
    echo "Visit: https://nodejs.org/"
    exit 1
  fi
  
  echo "Installing Supabase CLI globally..."
  npm install -g supabase
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install Supabase CLI."
    exit 1
  fi
  
  echo "✅ Supabase CLI installed successfully"
else
  echo "✅ Supabase CLI found"
fi

echo ""

# Check if supabase directory exists
if [ ! -d "supabase" ]; then
  echo "❌ 'supabase' directory not found in project root."
  exit 1
fi

# Check if migrations directory exists
if [ ! -d "supabase/migrations" ]; then
  echo "⚠️  'supabase/migrations' directory not found."
  echo "No migrations to run."
  exit 0
fi

# Count pending migrations
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATION_COUNT" -eq 0 ]; then
  echo "ℹ️  No migration files found in supabase/migrations/"
  exit 0
fi

echo "📋 Found $MIGRATION_COUNT migration file(s)"
echo ""

# Check if user is logged in to Supabase
echo "🔍 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
  echo "⚠️  Not logged in to Supabase."
  echo ""
  echo "Logging in to Supabase..."
  supabase login
  if [ $? -ne 0 ]; then
    echo "❌ Failed to login to Supabase."
    echo "Please run 'supabase login' manually and try again."
    exit 1
  fi
  echo "✅ Successfully logged in to Supabase"
else
  echo "✅ Authenticated with Supabase"
fi

echo ""

# Check if project is linked
echo "🔗 Checking project link..."
PROJECT_LINKED=false
PROJECT_NAME="polariz-ai-speech"
PROJECT_REF="gsnsjrfudxyczpldbkzc"

# Check if .supabase directory exists with project config
if [ -f ".supabase/config.toml" ]; then
  # Try to get project status to verify it's properly linked
  if supabase status &> /dev/null; then
    PROJECT_LINKED=true
    echo "✅ Project is already linked"
  else
    # Check if it's linked to remote (check if it matches our project)
    if grep -q "project_id" .supabase/config.toml 2>/dev/null; then
      # Verify it's linked to the correct project
      if grep -q "$PROJECT_REF" .supabase/config.toml 2>/dev/null || supabase projects list 2>/dev/null | grep -q "$PROJECT_REF"; then
        PROJECT_LINKED=true
        echo "✅ Project is linked to remote: $PROJECT_REF"
      else
        echo "⚠️  Project is linked to a different Supabase project"
        PROJECT_LINKED=false
      fi
    fi
  fi
fi

# If not linked, automatically link to polariz-ai-speech project
if [ "$PROJECT_LINKED" = false ]; then
  echo "⚠️  Project is not linked to Supabase."
  echo ""
  echo "🔗 Linking to project: $PROJECT_REF"
  
  supabase link --project-ref "$PROJECT_REF"
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully linked to project: $PROJECT_REF"
    PROJECT_LINKED=true
  else
    echo "❌ Failed to link to project: $PROJECT_REF"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   - Make sure you're logged in: supabase login"
    echo "   - Verify the project reference ID is correct"
    echo "   - Check that you have access to this project"
    exit 1
  fi
fi

echo ""

# Check and start Docker Desktop if needed
echo "🐳 Checking Docker status..."
if ! docker info &> /dev/null; then
  echo "⚠️  Docker is not running."
  
  # Detect OS and start Docker accordingly
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - start Docker Desktop
    echo "🚀 Starting Docker Desktop..."
    open -a Docker
    
    # Wait for Docker to start (max 60 seconds)
    echo "⏳ Waiting for Docker to start..."
    MAX_WAIT=60
    ELAPSED=0
    while ! docker info &> /dev/null && [ $ELAPSED -lt $MAX_WAIT ]; do
      sleep 2
      ELAPSED=$((ELAPSED + 2))
      echo "   Still waiting... (${ELAPSED}s/${MAX_WAIT}s)"
    done
    
    if docker info &> /dev/null; then
      echo "✅ Docker Desktop started successfully"
    else
      echo "❌ Docker failed to start within ${MAX_WAIT} seconds."
      echo "💡 Please start Docker Desktop manually and try again."
      exit 1
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - try to start Docker service
    echo "🚀 Starting Docker service..."
    if command -v systemctl &> /dev/null; then
      sudo systemctl start docker
      sleep 3
      if docker info &> /dev/null; then
        echo "✅ Docker service started successfully"
      else
        echo "❌ Failed to start Docker service."
        echo "💡 Please start Docker manually: sudo systemctl start docker"
        exit 1
      fi
    else
      echo "❌ Cannot start Docker automatically on this system."
      echo "💡 Please start Docker manually and try again."
      exit 1
    fi
  else
    echo "❌ Cannot automatically start Docker on this operating system."
    echo "💡 Please start Docker manually and try again."
    exit 1
  fi
else
  echo "✅ Docker is running"
fi

echo ""

# Check port 54322 (Supabase's default port)
echo "🔍 Checking port 54322..."
PORT_54322_IN_USE=false
PORT_PID=""

# Check if port 54322 is in use
if command -v lsof &> /dev/null; then
  PORT_PID=$(lsof -ti:54322 2>/dev/null)
elif command -v netstat &> /dev/null; then
  PORT_PID=$(netstat -tulpn 2>/dev/null | grep ':54322' | awk '{print $7}' | cut -d'/' -f1 | head -n1)
elif command -v ss &> /dev/null; then
  PORT_PID=$(ss -tulpn 2>/dev/null | grep ':54322' | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | head -n1)
fi

if [ -n "$PORT_PID" ]; then
  PORT_54322_IN_USE=true
  echo "⚠️  Port 54322 is in use by process: $PORT_PID"
  
  # Check if it's Supabase by checking if supabase status works
  if supabase status &> /dev/null; then
    echo "✅ Supabase is already running on port 54322"
  else
    echo "⚠️  Port 54322 is occupied by a non-Supabase process."
    echo "🛑 Killing process $PORT_PID on port 54322..."
    
    if kill -9 "$PORT_PID" 2>/dev/null; then
      echo "✅ Process $PORT_PID killed successfully"
      sleep 2
    else
      echo "❌ Failed to kill process $PORT_PID"
      echo "💡 Please manually kill the process using port 54322 and try again."
      exit 1
    fi
  fi
else
  echo "✅ Port 54322 is available"
fi

echo ""

# Always run supabase start (it's idempotent - safe to run if already running)
echo "🚀 Starting Supabase..."
supabase start

if [ $? -eq 0 ]; then
  echo "✅ Supabase is ready"
else
  echo "❌ Failed to start Supabase."
  echo ""
  echo "💡 Troubleshooting:"
  echo "   - Make sure Docker is running"
  echo "   - Check if port 54322 is available"
  echo "   - Try running 'supabase start' manually to see detailed errors"
  exit 1
fi

echo ""
echo "🚀 Running migrations with debug output..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run supabase migration up with debug flag
# Capture both stdout and stderr to show all output
supabase migration up --debug 2>&1

MIGRATION_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed with exit code: $MIGRATION_EXIT_CODE"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Error Details:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "The debug output above should contain detailed error messages."
  echo "Common issues:"
  echo ""
  echo "💡 Troubleshooting tips:"
  echo "   - Check the error messages above for specific SQL syntax errors"
  echo "   - Verify the migration file syntax is correct"
  echo "   - Ensure Supabase is running locally: supabase start"
  echo "   - Or link to remote project: supabase link --project-ref <project-ref>"
  echo "   - Check if there are conflicting migrations"
  echo "   - Verify database connection and permissions"
  echo ""
  echo "To see more details, you can also run:"
  echo "   supabase migration up --debug"
  exit 1
fi

