#!/bin/bash

# Script to deploy Supabase Edge Functions
# Usage: ./deploy_supabase_functions.sh [function_name]
# If no function name is provided, all functions will be deployed

# Get the project root directory
PROJECT_ROOT="$(dirname "$(dirname "$0")")"
cd "$PROJECT_ROOT"

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

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found."
  echo "Please install it using: npm install -g supabase"
  echo "Or visit: https://supabase.com/docs/guides/cli"
  exit 1
fi

echo "✅ Supabase CLI found"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
  echo "⚠️  Not logged in to Supabase. Attempting to login..."
  supabase login
  if [ $? -ne 0 ]; then
    echo "❌ Failed to login to Supabase. Please run 'supabase login' manually."
    exit 1
  fi
fi

echo "✅ Authenticated with Supabase"

# Check if supabase directory exists
if [ ! -d "supabase" ]; then
  echo "❌ 'supabase' directory not found in project root."
  exit 1
fi

# Check if functions directory exists
if [ ! -d "supabase/functions" ]; then
  echo "❌ 'supabase/functions' directory not found."
  exit 1
fi

# Get the function name from argument (if provided)
FUNCTION_NAME="$1"

# If a specific function is provided, deploy only that function
if [ -n "$FUNCTION_NAME" ]; then
  FUNCTION_PATH="supabase/functions/$FUNCTION_NAME"
  
  if [ ! -d "$FUNCTION_PATH" ]; then
    echo "❌ Function '$FUNCTION_NAME' not found at $FUNCTION_PATH"
    echo ""
    echo "Available functions:"
    ls -1 supabase/functions/ | sed 's/^/  - /'
    exit 1
  fi
  
  echo "🚀 Deploying function: $FUNCTION_NAME"
  echo "📍 Path: $FUNCTION_PATH"
  echo ""
  
  supabase functions deploy "$FUNCTION_NAME"
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully deployed function: $FUNCTION_NAME"
  else
    echo ""
    echo "❌ Failed to deploy function: $FUNCTION_NAME"
    exit 1
  fi
else
  # Deploy all functions
  echo "🚀 Deploying all Supabase Edge Functions..."
  echo ""
  
  # Get list of all functions
  FUNCTIONS=$(ls -1 supabase/functions/)
  
  if [ -z "$FUNCTIONS" ]; then
    echo "⚠️  No functions found in supabase/functions/"
    exit 0
  fi
  
  echo "Found functions:"
  echo "$FUNCTIONS" | sed 's/^/  - /'
  echo ""
  
  # Deploy each function
  SUCCESS_COUNT=0
  FAILED_COUNT=0
  FAILED_FUNCTIONS=()
  
  for func in $FUNCTIONS; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Deploying: $func"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    supabase functions deploy "$func"
    
    if [ $? -eq 0 ]; then
      echo "✅ Successfully deployed: $func"
      ((SUCCESS_COUNT++))
    else
      echo "❌ Failed to deploy: $func"
      FAILED_FUNCTIONS+=("$func")
      ((FAILED_COUNT++))
    fi
    echo ""
  done
  
  # Summary
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Deployment Summary"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ Successful: $SUCCESS_COUNT"
  echo "❌ Failed: $FAILED_COUNT"
  
  if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "Failed functions:"
    for func in "${FAILED_FUNCTIONS[@]}"; do
      echo "  - $func"
    done
    echo ""
    echo "💡 Tip: Try deploying failed functions individually:"
    echo "   ./deploy_supabase_functions.sh <function_name>"
    exit 1
  else
    echo ""
    echo "🎉 All functions deployed successfully!"
  fi
fi

